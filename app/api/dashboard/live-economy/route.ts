import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// ═══════════════════════════════════════════════════════════════════════════
// GET /api/dashboard/live-economy
// Devuelve estado financiero consolidado de todos los proyectos EXTERNOS
// Para el Agent Command Center y visualización Sistema Solar
// ═══════════════════════════════════════════════════════════════════════════

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Obtener proyectos EXTERNOS con sus decisiones recientes
    const projects = await prisma.externalProject.findMany({
      where: { userId, status: { in: ['active', 'paused'] } },
      include: {
        decisions: {
          orderBy: { timestamp: 'desc' },
          take: 20, // Últimas 20 decisiones por proyecto
        }
      },
      orderBy: { totalRevenue: 'desc' }
    });
    
    // Calcular métricas globales
    const totalBalance = projects.reduce((sum, p) => sum + (p.currentBalance || 0), 0);
    const totalRevenue = projects.reduce((sum, p) => sum + (p.totalRevenue || 0), 0);
    const monthlyRevenue = projects.reduce((sum, p) => sum + (p.monthlyRevenue || 0), 0);
    const totalActiveAgents = projects.length; // Cada proyecto externo es un "agente"
    
    // Obtener últimas 100 decisiones globales (para el feed)
    const recentDecisions = await prisma.externalDecision.findMany({
      where: {
        project: { userId }
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
      include: {
        project: {
          select: { name: true }
        }
      }
    });
    
    // Formatear decisiones para el frontend
    const formattedDecisions = recentDecisions.map(d => ({
      id: d.id,
      timestamp: d.timestamp.toISOString(),
      projectName: d.project.name,
      agentName: d.agentName || 'Agent',
      actionLabel: d.actionLabel || d.actionTaken.replace(/_/g, ' '),
      contextType: d.contextType,
      outcome: d.outcome,
      revenue: d.revenueGenerated,
      riskLevel: d.riskLevel,
      coherenceImpact: d.coherenceImpact,
    }));
    
    // Calcular salud del sistema basado en coherencia de decisiones recientes
    const recentCoherence = recentDecisions
      .filter(d => d.coherenceImpact !== null)
      .slice(0, 50);
    
    const avgCoherenceImpact = recentCoherence.length > 0
      ? recentCoherence.reduce((sum, d) => sum + (d.coherenceImpact || 0), 0) / recentCoherence.length
      : 0;
    
    // Health score: 50 base + impacto de coherencia escalado
    const systemHealth = Math.max(0, Math.min(100, 50 + (avgCoherenceImpact * 500)));
    
    // Calcular tendencia (últimas 24h vs 24h anteriores)
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    
    const last24h = recentDecisions.filter(d => d.timestamp >= oneDayAgo);
    const prev24h = recentDecisions.filter(d => d.timestamp >= twoDaysAgo && d.timestamp < oneDayAgo);
    
    const last24hRevenue = last24h.reduce((sum, d) => sum + (d.revenueGenerated || 0), 0);
    const prev24hRevenue = prev24h.reduce((sum, d) => sum + (d.revenueGenerated || 0), 0);
    
    let revenueTrend: 'up' | 'down' | 'stable' = 'stable';
    if (last24hRevenue > prev24hRevenue * 1.1) revenueTrend = 'up';
    else if (last24hRevenue < prev24hRevenue * 0.9) revenueTrend = 'down';
    
    // Proyectos formateados para visualización (Sistema Solar)
    const formattedProjects = projects.map(p => {
      const revenue = p.totalRevenue || 0;
      // Calcular transacciones por hora basado en decisiones recientes
      const recentDecisions = p.decisions.filter(d => {
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return d.timestamp >= hourAgo;
      });
      const transactionsPerHour = recentDecisions.length;
      
      return {
        id: p.id,
        name: p.name,
        status: p.status,
        
        // Financieros
        balance: p.currentBalance || 0,
        totalRevenue: revenue,
        monthlyRevenue: p.monthlyRevenue || 0,
        
        // Agentes
        activeAgents: p.decisions.length > 0 ? 1 : 0, // Estimado basado en actividad
        agentMode: p.agentMode || 'auto',
        
        // Actividad
        transactionsPerHour,
        lastTransaction: p.lastTransactionAt?.toISOString() || null,
        recentDecisionsCount: p.decisions.length,
        
        // Métricas calculadas
        marketSentiment: 0.5, // Default
        userActivityLevel: Math.min(1, p.decisions.length / 50), // Basado en actividad
        
        // Para visualización Sistema Solar
        orbitRadius: 20 + Math.min(30, revenue / 500), // 20-50 unidades
        orbitSpeed: Math.min(2, 0.2 + transactionsPerHour / 10), // 0.2-2 velocidad
        planetSize: 1.5 + Math.log10(revenue + 1) * 0.8, // Tamaño logarítmico
        glowIntensity: Math.min(1, transactionsPerHour / 20), // Brillo por actividad
      };
    });
    
    // Alertas activas
    const alerts: Array<{ type: string; message: string; projectId?: string; severity: 'info' | 'warning' | 'critical' }> = [];
    
    // Detectar proyectos con problemas
    projects.forEach(p => {
      if (p.agentMode === 'paused') {
        alerts.push({
          type: 'paused',
          message: `${p.name} tiene agentes pausados`,
          projectId: p.id,
          severity: 'warning'
        });
      }
      
      // Detectar decisiones de alto riesgo recientes
      const highRiskDecisions = p.decisions.filter(d => d.riskLevel && d.riskLevel > 0.8);
      if (highRiskDecisions.length > 3) {
        alerts.push({
          type: 'high_risk',
          message: `${p.name}: ${highRiskDecisions.length} decisiones de alto riesgo`,
          projectId: p.id,
          severity: 'critical'
        });
      }
    });
    
    // Alerta si no hay actividad reciente
    if (last24hRevenue === 0 && projects.length > 0) {
      alerts.push({
        type: 'no_activity',
        message: 'Sin ingresos en las últimas 24 horas',
        severity: 'info'
      });
    }
    
    return NextResponse.json({
      success: true,
      
      // Métricas globales
      global: {
        totalBalance: Math.round(totalBalance * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
        totalActiveAgents,
        systemHealth: Math.round(systemHealth),
        projectCount: projects.length,
        decisionsToday: last24h.length,
        revenueTrend,
      },
      
      // Proyectos para el Sistema Solar
      projects: formattedProjects,
      
      // Feed de decisiones recientes
      recentDecisions: formattedDecisions,
      
      // Alertas activas
      alerts,
      
      // Timestamp para polling
      lastUpdate: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error in /api/dashboard/live-economy:', error);
    return NextResponse.json(
      { error: 'Error al cargar economía en vivo', details: (error as Error).message },
      { status: 500 }
    );
  }
}
