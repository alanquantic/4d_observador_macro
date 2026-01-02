
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

    const relationships = await prisma.relationship.findMany({
      where: { userId },
      orderBy: { connectionQuality: 'desc' }
    });

    return NextResponse.json(relationships);
  } catch (error) {
    console.error('Error obteniendo relaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await request.json();

    const relationship = await prisma.relationship.create({
      data: {
        userId,
        name: data.name,
        description: data.description || null,
        relationshipType: data.relationshipType || 'personal',
        connectionQuality: data.connectionQuality || 5.0,
        energyExchange: data.energyExchange || 'balanced',
        contactFrequency: data.contactFrequency || null,
        importance: data.importance || 5.0,
        tags: data.tags || []
      }
    });

    return NextResponse.json(relationship);
  } catch (error) {
    console.error('Error creando relación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    const existingRelationship = await prisma.relationship.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });

    if (!existingRelationship) {
      return NextResponse.json({ error: 'Relación no encontrada' }, { status: 404 });
    }

    const relationship = await prisma.relationship.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(relationship);
  } catch (error) {
    console.error('Error actualizando relación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
