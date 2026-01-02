
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/daily-mapping/insights - Generate insights from entries
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { days = 30, type = 'general' } = body;

    // Get entries for analysis period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await prisma.dailyEntry.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
        },
      },
      include: {
        emotions: true,
        intentionFulfillments: {
          include: {
            intention: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    if (entries.length === 0) {
      return NextResponse.json({
        insights: 'No hay suficientes entradas para generar insights. Empieza a registrar tu experiencia diaria.',
        summary: null,
      });
    }

    // Calculate metrics
    const avgEnergy = entries.reduce((sum, e) => sum + e.energyLevel, 0) / entries.length;
    const avgEmotional = entries.reduce((sum, e) => sum + e.emotionalState, 0) / entries.length;
    
    const emotionCounts: Record<string, number> = {};
    entries.forEach(entry => {
      entry.emotions.forEach(emotion => {
        emotionCounts[emotion.emotionType] = (emotionCounts[emotion.emotionType] || 0) + 1;
      });
    });
    const topEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);

    const totalIntentions = entries.reduce((sum, e) => sum + e.intentionFulfillments.length, 0);
    const fulfilledIntentions = entries.reduce(
      (sum, e) => sum + e.intentionFulfillments.filter(f => f.fulfilled).length,
      0
    );
    const fulfillmentRate = totalIntentions > 0 ? (fulfilledIntentions / totalIntentions) * 100 : 0;

    const synchronicityCount = entries.filter(e => e.synchronicities && e.synchronicities.trim().length > 0).length;

    // Build context for AI
    const context = `Analiza los últimos ${days} días del usuario:

MÉTRICAS:
- Energía promedio: ${avgEnergy.toFixed(1)}/10
- Estado emocional promedio: ${avgEmotional.toFixed(1)}/10
- Total de entradas: ${entries.length} días
- Emociones más frecuentes: ${topEmotions.join(', ') || 'No especificadas'}
- Tasa de cumplimiento de intenciones: ${fulfillmentRate.toFixed(0)}%
- Sincronicidades registradas: ${synchronicityCount}

OBSERVACIONES RECIENTES:
${entries.slice(-5).map(e => `- ${new Date(e.date).toLocaleDateString()}: Energía ${e.energyLevel}, Emocional ${e.emotionalState}`).join('\n')}

Como guía de consciencia 4D, proporciona un análisis profundo que incluya:
1. Resumen de la evolución en este período
2. Patrones principales detectados (emocionales, energéticos, comportamentales)
3. Insights desde la perspectiva del Observador 4D
4. Recomendaciones específicas y accionables
5. Áreas que necesitan atención
6. Oportunidades de crecimiento

Escribe en un tono sabio pero cercano, inspirador pero práctico. Usa la segunda persona (tú).`;

    // Call Gemini AI
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/gemini/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: context,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate insights with AI');
    }

    const data = await response.json();
    const insights = data.response || 'No se pudieron generar insights en este momento.';

    // Try to detect patterns automatically
    const detectedPatterns = [];
    
    // Energy pattern
    const weekdayEnergy = entries
      .filter(e => {
        const day = new Date(e.date).getDay();
        return day >= 1 && day <= 5;
      })
      .reduce((sum, e) => sum + e.energyLevel, 0) / Math.max(1, entries.filter(e => {
        const day = new Date(e.date).getDay();
        return day >= 1 && day <= 5;
      }).length);
    
    const weekendEnergy = entries
      .filter(e => {
        const day = new Date(e.date).getDay();
        return day === 0 || day === 6;
      })
      .reduce((sum, e) => sum + e.energyLevel, 0) / Math.max(1, entries.filter(e => {
        const day = new Date(e.date).getDay();
        return day === 0 || day === 6;
      }).length);

    if (Math.abs(weekdayEnergy - weekendEnergy) > 1.5) {
      detectedPatterns.push({
        type: 'energy_cycle',
        description: weekdayEnergy > weekendEnergy 
          ? 'Tu energía es más alta entre semana que los fines de semana'
          : 'Tu energía es más alta los fines de semana que entre semana',
        confidence: 0.8,
      });
    }

    // Save detected patterns
    for (const pattern of detectedPatterns) {
      try {
        await prisma.pattern.create({
          data: {
            userId: user.id,
            patternType: pattern.type,
            title: pattern.description,
            description: pattern.description,
            confidence: pattern.confidence,
            aiGenerated: true,
          },
        });
      } catch (error) {
        console.error('Error saving pattern:', error);
      }
    }

    return NextResponse.json({
      insights,
      summary: {
        period: days,
        totalEntries: entries.length,
        avgEnergy: parseFloat(avgEnergy.toFixed(1)),
        avgEmotional: parseFloat(avgEmotional.toFixed(1)),
        topEmotions,
        fulfillmentRate: parseFloat(fulfillmentRate.toFixed(0)),
        synchronicityCount,
        detectedPatterns,
      },
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
