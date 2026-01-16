import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/dashboard/revenue-history
// Devuelve historial de ingresos y decisiones agrupado por día
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    
    // Calcular fecha de inicio según periodo
    const now = new Date();
    const startDate = new Date(now);
    
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    
    // Obtener decisiones en el periodo
    const decisions = await prisma.externalDecision.findMany({
      where: {
        project: { userId },
        timestamp: { gte: startDate }
      },
      select: {
        timestamp: true,
        revenueGenerated: true,
        project: { select: { name: true } }
      },
      orderBy: { timestamp: 'asc' }
    });
    
    // Agrupar por día
    const groupedData = new Map<string, {
      revenue: number;
      decisions: number;
      projects: { [key: string]: number };
    }>();
    
    // Inicializar todos los días del periodo
    const current = new Date(startDate);
    while (current <= now) {
      const dateKey = current.toISOString().split('T')[0];
      groupedData.set(dateKey, { revenue: 0, decisions: 0, projects: {} });
      current.setDate(current.getDate() + 1);
    }
    
    // Agregar datos de decisiones
    decisions.forEach(decision => {
      const dateKey = decision.timestamp.toISOString().split('T')[0];
      const dayData = groupedData.get(dateKey);
      
      if (dayData) {
        dayData.revenue += decision.revenueGenerated || 0;
        dayData.decisions += 1;
        
        const projectName = decision.project.name;
        if (!dayData.projects[projectName]) {
          dayData.projects[projectName] = 0;
        }
        dayData.projects[projectName] += decision.revenueGenerated || 0;
      }
    });
    
    // Convertir a array
    const history = Array.from(groupedData.entries()).map(([date, data]) => ({
      date,
      revenue: Math.round(data.revenue * 100) / 100,
      decisions: data.decisions,
      projects: data.projects
    }));
    
    // Calcular métricas adicionales
    const totalRevenue = history.reduce((sum, d) => sum + d.revenue, 0);
    const totalDecisions = history.reduce((sum, d) => sum + d.decisions, 0);
    const avgDaily = history.length > 0 ? totalRevenue / history.length : 0;
    
    // Calcular tendencia
    const midpoint = Math.floor(history.length / 2);
    const firstHalf = history.slice(0, midpoint).reduce((sum, d) => sum + d.revenue, 0);
    const secondHalf = history.slice(midpoint).reduce((sum, d) => sum + d.revenue, 0);
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (secondHalf > firstHalf * 1.1) trend = 'up';
    else if (secondHalf < firstHalf * 0.9) trend = 'down';
    
    const trendPercent = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;
    
    return NextResponse.json({
      success: true,
      period,
      history,
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalDecisions,
        avgDaily: Math.round(avgDaily * 100) / 100,
        trend,
        trendPercent: Math.round(trendPercent * 100) / 100
      }
    });
    
  } catch (error) {
    console.error('Error in /api/dashboard/revenue-history:', error);
    return NextResponse.json(
      { error: 'Error al cargar historial', details: (error as Error).message },
      { status: 500 }
    );
  }
}
