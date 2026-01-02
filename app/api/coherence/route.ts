
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Obtener las métricas más recientes
    const latestMetrics = await prisma.userMetrics.findFirst({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    if (!latestMetrics) {
      // Si no hay métricas, crear unas por defecto
      const defaultMetrics = await prisma.userMetrics.create({
        data: {
          userId,
          overallCoherence: 65.0,
          emotionalCoherence: 70.0,
          logicalCoherence: 60.0,
          energeticCoherence: 65.0,
          synchronicityCount: 3,
          synchronicityScore: 75.0,
          manifestationRate: 55.0,
          projectCompletion: 40.0,
          relationshipHealth: 80.0,
          weeklyTrend: 'improving'
        }
      });
      return NextResponse.json(defaultMetrics);
    }

    return NextResponse.json(latestMetrics);
  } catch (error) {
    console.error('Error obteniendo métricas de coherencia:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await request.json();

    const {
      emotionalCoherence,
      logicalCoherence,
      energeticCoherence
    } = data;

    // Calcular coherencia general
    const overallCoherence = (emotionalCoherence + logicalCoherence + energeticCoherence) / 3;

    // Actualizar o crear métricas
    const metrics = await prisma.userMetrics.upsert({
      where: {
        userId_date: {
          userId,
          date: new Date()
        }
      },
      update: {
        emotionalCoherence,
        logicalCoherence,
        energeticCoherence,
        overallCoherence
      },
      create: {
        userId,
        emotionalCoherence,
        logicalCoherence,
        energeticCoherence,
        overallCoherence,
        synchronicityCount: 0,
        manifestationRate: 50.0,
        projectCompletion: 30.0,
        relationshipHealth: 70.0
      }
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error actualizando métricas de coherencia:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
