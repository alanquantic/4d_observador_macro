
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Obtener datos del dashboard
    const [
      recentEntries,
      activeProjects,
      relationships,
      manifestations,
      metrics
    ] = await Promise.all([
      // Últimas 7 entradas diarias
      prisma.dailyEntry.findMany({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' },
        take: 7
      }),
      
      // Proyectos activos
      prisma.project.findMany({
        where: { 
          userId: session.user.id,
          status: 'active'
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Relaciones principales
      prisma.relationship.findMany({
        where: { userId: session.user.id },
        orderBy: { importance: 'desc' }
      }),

      // Manifestaciones activas
      prisma.manifestation.findMany({
        where: { 
          userId: session.user.id,
          status: { in: ['intention', 'action', 'manifesting'] }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Métricas más recientes
      prisma.userMetrics.findFirst({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' }
      })
    ]);

    // Calcular estadísticas generales
    const avgCoherence = recentEntries.length > 0 
      ? recentEntries.reduce((sum, entry) => sum + (entry.coherenceLevel || 0), 0) / recentEntries.length
      : 0;

    const avgEnergyLevel = recentEntries.length > 0
      ? recentEntries.reduce((sum, entry) => sum + entry.energyLevel, 0) / recentEntries.length
      : 0;

    const totalSynchronicities = recentEntries.reduce((sum, entry) => {
      const syncs = entry.synchronicitiesData as any;
      return sum + (Array.isArray(syncs) ? syncs.length : (entry.synchronicities && entry.synchronicities.length > 0 ? 1 : 0));
    }, 0);

    return NextResponse.json({
      coherence: {
        overall: metrics?.overallCoherence || avgCoherence || 0,
        emotional: metrics?.emotionalCoherence || 0,
        logical: metrics?.logicalCoherence || 0,
        energetic: metrics?.energeticCoherence || 0
      },
      stats: {
        activeProjects: activeProjects.length,
        totalRelationships: relationships.length,
        activeManifestations: manifestations.length,
        avgEnergyLevel: avgEnergyLevel,
        synchronicities: totalSynchronicities
      },
      recentData: {
        entries: recentEntries,
        projects: activeProjects.slice(0, 5),
        relationships: relationships.slice(0, 5),
        manifestations: manifestations.slice(0, 5)
      },
      trends: {
        coherenceTrend: calculateTrend(recentEntries.map(e => e.coherenceLevel || 0)),
        energyTrend: calculateTrend(recentEntries.map(e => e.energyLevel))
      }
    });
  } catch (error) {
    console.error("Error obteniendo datos del dashboard:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

function calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const recent = values.slice(0, Math.ceil(values.length / 2));
  const older = values.slice(Math.ceil(values.length / 2));
  
  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
  
  const diff = recentAvg - olderAvg;
  
  if (diff > 5) return 'up';
  if (diff < -5) return 'down';
  return 'stable';
}
