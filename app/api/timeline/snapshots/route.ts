/**
 * API de Snapshots del Timeline - OBSERVADOR4D
 * 
 * Guarda y recupera snapshots históricos de nodos para visualizar evolución.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { interpretNode } from '@/lib/nodeInterpreter';

// GET - Obtener snapshots
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get('nodeId');
    const nodeType = searchParams.get('nodeType');
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '50');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      userId: session.user.id,
      createdAt: { gte: startDate },
    };

    if (nodeId) where.nodeId = nodeId;
    if (nodeType) where.nodeType = nodeType;

    const snapshots = await prisma.nodeSnapshot.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Agrupar por nodo para análisis de evolución
    const groupedByNode: Record<string, typeof snapshots> = {};
    snapshots.forEach(snap => {
      if (!groupedByNode[snap.nodeId]) {
        groupedByNode[snap.nodeId] = [];
      }
      groupedByNode[snap.nodeId].push(snap);
    });

    // Calcular tendencias por nodo
    const trends = Object.entries(groupedByNode).map(([nodeId, snaps]) => {
      const sorted = snaps.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      if (sorted.length < 2) {
        return {
          nodeId,
          nodeLabel: sorted[0]?.nodeLabel || '',
          nodeType: sorted[0]?.nodeType || '',
          trend: 'stable',
          energyChange: 0,
          coherenceChange: 0,
          snapshotCount: sorted.length,
        };
      }

      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const energyChange = last.energy - first.energy;
      const coherenceChange = last.coherence - first.coherence;

      let trend = 'stable';
      if (energyChange > 0.1 && coherenceChange > 0.1) trend = 'improving';
      else if (energyChange < -0.1 || coherenceChange < -0.1) trend = 'declining';
      else if (energyChange > 0.05 || coherenceChange > 0.05) trend = 'slight_improvement';

      return {
        nodeId,
        nodeLabel: last.nodeLabel,
        nodeType: last.nodeType,
        trend,
        energyChange: Math.round(energyChange * 100),
        coherenceChange: Math.round(coherenceChange * 100),
        snapshotCount: sorted.length,
        firstSnapshot: first.createdAt,
        lastSnapshot: last.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      snapshots,
      trends,
      summary: {
        total: snapshots.length,
        improving: trends.filter(t => t.trend === 'improving').length,
        stable: trends.filter(t => t.trend === 'stable').length,
        declining: trends.filter(t => t.trend === 'declining').length,
      },
    });

  } catch (error) {
    console.error('Error en GET /api/timeline/snapshots:', error);
    return NextResponse.json(
      { error: 'Error al obtener snapshots', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST - Crear snapshot
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      nodeId, 
      nodeType, 
      nodeLabel, 
      energy, 
      coherence, 
      connections,
      triggerType = 'manual',
      triggerReason,
      metadata 
    } = body;

    // Validaciones
    if (!nodeId || !nodeType || !nodeLabel) {
      return NextResponse.json(
        { error: 'nodeId, nodeType y nodeLabel son requeridos' },
        { status: 400 }
      );
    }

    // Calcular interpretación
    const interpretation = interpretNode(
      { 
        id: nodeId, 
        type: nodeType, 
        label: nodeLabel, 
        energy: energy || 0.5, 
        coherence,
        x: 0, y: 0, z: 0, size: 1, color: '#fff'
      },
      [], // links vacíos para snapshot individual
      coherence
    );

    const snapshot = await prisma.nodeSnapshot.create({
      data: {
        userId: session.user.id,
        nodeId,
        nodeType,
        nodeLabel,
        energy: energy || 0.5,
        coherence: coherence || 0.5,
        connections: connections || 0,
        triggerType,
        triggerReason,
        statusLabel: interpretation.statusLabel,
        recommendation: interpretation.recommendation,
        metadata: metadata || null,
      },
    });

    return NextResponse.json({
      success: true,
      snapshot,
    });

  } catch (error) {
    console.error('Error en POST /api/timeline/snapshots:', error);
    return NextResponse.json(
      { error: 'Error al crear snapshot', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar snapshots antiguos (limpieza)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const daysToKeep = parseInt(searchParams.get('daysToKeep') || '90');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.nodeSnapshot.deleteMany({
      where: {
        userId: session.user.id,
        createdAt: { lt: cutoffDate },
      },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `Eliminados ${result.count} snapshots anteriores a ${cutoffDate.toISOString().split('T')[0]}`,
    });

  } catch (error) {
    console.error('Error en DELETE /api/timeline/snapshots:', error);
    return NextResponse.json(
      { error: 'Error al eliminar snapshots', details: (error as Error).message },
      { status: 500 }
    );
  }
}

