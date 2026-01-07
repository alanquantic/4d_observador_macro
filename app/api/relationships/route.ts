
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createSnapshotIfChanged } from '@/lib/snapshotService';

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

    // Crear snapshot automático de la nueva relación
    await createSnapshotIfChanged({
      userId,
      nodeId: `relationship_${relationship.id}`,
      nodeType: 'relationship',
      nodeLabel: relationship.name,
      energy: Math.min(1, Math.max(0.1, (data.connectionQuality || 5) / 10)),
      coherence: Math.min(1, Math.max(0.1, (data.importance || 5) / 10)),
      connections: 1,
      triggerType: 'create',
      triggerReason: 'Relación creada',
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

    // Crear snapshot automático si hay cambios significativos
    await createSnapshotIfChanged({
      userId: session.user.id,
      nodeId: `relationship_${relationship.id}`,
      nodeType: 'relationship',
      nodeLabel: relationship.name,
      energy: Math.min(1, Math.max(0.1, relationship.connectionQuality / 10)),
      coherence: Math.min(1, Math.max(0.1, relationship.importance / 10)),
      connections: 1,
      triggerType: 'update',
      triggerReason: 'Relación actualizada',
    });

    return NextResponse.json(relationship);
  } catch (error) {
    console.error('Error actualizando relación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
