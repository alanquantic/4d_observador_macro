import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/dashboard/predictions
// Usa Gemini para predecir tendencias de ingresos basado en historial
// ═══════════════════════════════════════════════════════════════════════════

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Obtener últimos 30 días de datos
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const decisions = await prisma.externalDecision.findMany({
      where: {
        project: { userId },
        timestamp: { gte: thirtyDaysAgo }
      },
      select: {
        timestamp: true,
        revenueGenerated: true,
        contextType: true,
        outcome: true,
        project: { select: { name: true } }
      },
      orderBy: { timestamp: 'asc' }
    });
    
    // Obtener proyectos activos
    const projects = await prisma.externalProject.findMany({
      where: { userId, status: 'active' },
      select: { name: true, totalRevenue: true, monthlyRevenue: true }
    });
    
    // Si no hay datos suficientes
    if (decisions.length < 5) {
      return NextResponse.json({
        success: true,
        predictions: {
          weeklyForecast: 0,
          monthlyForecast: 0,
          trend: 'insufficient_data',
          confidence: 0,
          recommendations: [
            'Se necesitan más datos históricos para hacer predicciones precisas',
            'Registra al menos 5 decisiones de tus agentes para activar las predicciones'
          ],
          insights: []
        }
      });
    }
    
    // Agrupar por día
    const dailyRevenue = new Map<string, number>();
    decisions.forEach(d => {
      const dateKey = d.timestamp.toISOString().split('T')[0];
      dailyRevenue.set(dateKey, (dailyRevenue.get(dateKey) || 0) + (d.revenueGenerated || 0));
    });
    
    const revenueArray = Array.from(dailyRevenue.values());
    const avgDaily = revenueArray.reduce((a, b) => a + b, 0) / revenueArray.length;
    const lastWeek = revenueArray.slice(-7);
    const avgLastWeek = lastWeek.length > 0 ? lastWeek.reduce((a, b) => a + b, 0) / lastWeek.length : avgDaily;
    
    // Calcular tendencia simple
    const trend = avgLastWeek > avgDaily * 1.1 ? 'growing' : 
                  avgLastWeek < avgDaily * 0.9 ? 'declining' : 'stable';
    
    // Contar tipos de decisiones
    const contextCounts: { [key: string]: number } = {};
    const outcomeCounts: { [key: string]: number } = {};
    decisions.forEach(d => {
      contextCounts[d.contextType] = (contextCounts[d.contextType] || 0) + 1;
      if (d.outcome) {
        outcomeCounts[d.outcome] = (outcomeCounts[d.outcome] || 0) + 1;
      }
    });
    
    // Preparar contexto para Gemini
    const context = {
      dailyRevenue: revenueArray.slice(-14), // Últimos 14 días
      avgDaily,
      avgLastWeek,
      trend,
      projects: projects.map(p => ({ name: p.name, revenue: p.totalRevenue })),
      decisionTypes: contextCounts,
      outcomes: outcomeCounts,
      totalDecisions: decisions.length
    };
    
    // Llamar a Gemini para análisis
    let aiInsights: any = null;
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      const prompt = `Eres un analista financiero de IA. Analiza estos datos de un sistema de agentes que generan ingresos automáticamente.

DATOS:
- Ingresos últimos 14 días: ${JSON.stringify(context.dailyRevenue)}
- Promedio diario total: $${context.avgDaily.toFixed(2)}
- Promedio última semana: $${context.avgLastWeek.toFixed(2)}
- Tendencia: ${context.trend}
- Proyectos: ${JSON.stringify(context.projects)}
- Tipos de decisiones: ${JSON.stringify(context.decisionTypes)}
- Resultados: ${JSON.stringify(context.outcomes)}
- Total decisiones: ${context.totalDecisions}

Responde SOLO en JSON válido con esta estructura:
{
  "weeklyForecast": número (predicción de ingresos próxima semana),
  "monthlyForecast": número (predicción de ingresos próximo mes),
  "confidence": número 0-100 (qué tan seguro estás),
  "insights": [array de 3 strings con insights clave],
  "recommendations": [array de 2-3 strings con recomendaciones accionables],
  "risks": [array de 1-2 strings con riesgos potenciales]
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extraer JSON de la respuesta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiInsights = JSON.parse(jsonMatch[0]);
      }
    } catch (aiError) {
      console.error('Error en predicción IA:', aiError);
    }
    
    // Predicciones basadas en datos (fallback si falla IA)
    const weeklyForecast = aiInsights?.weeklyForecast || avgLastWeek * 7;
    const monthlyForecast = aiInsights?.monthlyForecast || avgLastWeek * 30;
    const confidence = aiInsights?.confidence || (decisions.length > 20 ? 70 : 40);
    
    return NextResponse.json({
      success: true,
      predictions: {
        weeklyForecast: Math.round(weeklyForecast * 100) / 100,
        monthlyForecast: Math.round(monthlyForecast * 100) / 100,
        trend,
        confidence,
        recommendations: aiInsights?.recommendations || [
          trend === 'growing' ? 'Mantén la estrategia actual, está funcionando bien' :
          trend === 'declining' ? 'Revisa la configuración de tus agentes' :
          'Considera expandir a nuevos mercados',
          'Monitorea los proyectos con menos actividad'
        ],
        insights: aiInsights?.insights || [
          `Promedio diario: $${avgDaily.toFixed(2)}`,
          `${decisions.length} decisiones en los últimos 30 días`,
          `Tendencia ${trend === 'growing' ? 'creciente' : trend === 'declining' ? 'decreciente' : 'estable'}`
        ],
        risks: aiInsights?.risks || []
      },
      dataPoints: decisions.length,
      lastUpdate: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in /api/dashboard/predictions:', error);
    return NextResponse.json(
      { error: 'Error al generar predicciones', details: (error as Error).message },
      { status: 500 }
    );
  }
}
