
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const {
      emotionalState,
      energyLevel,
      events,
      decisions,
      plannedActions,
      actualActions,
      observations,
      synchronicities
    } = await req.json();

    // Calcular coherencia básica basada en la alineación
    const alignmentScore = calculateAlignment(plannedActions, actualActions);
    const coherenceLevel = (emotionalState + energyLevel + alignmentScore) / 3;

    const entry = await prisma.dailyEntry.create({
      data: {
        userId: session.user.id,
        emotionalState: parseFloat(emotionalState),
        energyLevel: parseFloat(energyLevel),
        coherenceLevel,
        events: events || [],
        decisions: decisions || [],
        plannedActions: plannedActions || [],
        actualActions: actualActions || [],
        alignmentScore,
        observations: observations || "",
        synchronicities: synchronicities || []
      }
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error creando entrada diaria:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await prisma.dailyEntry.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate
        }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error obteniendo entradas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

function calculateAlignment(planned: string[], actual: string[]): number {
  if (!planned?.length || !actual?.length) return 50;
  
  const matches = planned.filter(p => 
    actual.some(a => a.toLowerCase().includes(p.toLowerCase()) || 
                     p.toLowerCase().includes(a.toLowerCase()))
  );
  
  return (matches.length / planned.length) * 100;
}
