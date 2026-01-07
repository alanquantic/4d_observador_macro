
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

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
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

    const project = await prisma.project.create({
      data: {
        userId,
        name: data.name,
        description: data.description || null,
        category: data.category || 'personal',
        status: data.status || 'active',
        progress: data.progress || 0.0,
        energyInvested: data.energyInvested || 0.0,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        impactLevel: data.impactLevel || 5.0,
        satisfactionLevel: data.satisfactionLevel || 5.0
      }
    });

    // Crear snapshot automático del nuevo proyecto
    const energy = ((data.energyInvested || 5) + (data.impactLevel || 5)) / 20;
    await createSnapshotIfChanged({
      userId,
      nodeId: `project_${project.id}`,
      nodeType: 'project',
      nodeLabel: project.name,
      energy: Math.min(1, Math.max(0.1, energy)),
      coherence: Math.min(1, Math.max(0.1, energy)),
      connections: 1,
      triggerType: 'create',
      triggerReason: 'Proyecto creado',
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creando proyecto:', error);
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

    // Verificar que el proyecto pertenece al usuario
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...updateData,
        targetDate: updateData.targetDate ? new Date(updateData.targetDate) : undefined,
        completedDate: updateData.status === 'completed' ? new Date() : undefined
      }
    });

    // Crear snapshot automático si hay cambios significativos
    const energy = ((project.energyInvested || 5) + (project.impactLevel || 5)) / 20;
    const coherence = project.coherenceScore ? project.coherenceScore / 100 : energy;
    await createSnapshotIfChanged({
      userId: session.user.id,
      nodeId: `project_${project.id}`,
      nodeType: 'project',
      nodeLabel: project.name,
      energy: Math.min(1, Math.max(0.1, energy)),
      coherence: Math.min(1, Math.max(0.1, coherence)),
      connections: 1,
      triggerType: 'update',
      triggerReason: 'Proyecto actualizado',
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error actualizando proyecto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
