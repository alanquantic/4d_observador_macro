/**
 * API de Onboarding - OBSERVADOR4D
 * 
 * Gestiona el estado del onboarding del usuario y valida pasos completados.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createFullSnapshot } from '@/lib/snapshotService';

// GET - Obtener estado del onboarding
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        onboardingCompleted: true,
        onboardingStep: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar qué ha creado el usuario
    const [hasProjects, hasRelationships, hasIntentions] = await Promise.all([
      prisma.project.count({ where: { userId: session.user.id } }),
      prisma.relationship.count({ where: { userId: session.user.id } }),
      prisma.intention.count({ where: { userId: session.user.id } }),
    ]);

    // Determinar paso actual basado en lo que existe
    let computedStep = 0;
    if (user.name && user.name.trim() !== '') computedStep = 1; // Self configurado
    if (hasProjects > 0) computedStep = Math.max(computedStep, 2); // Proyecto creado
    if (hasRelationships > 0) computedStep = Math.max(computedStep, 3); // Relación creada
    if (computedStep >= 3) computedStep = 4; // Listo para ver geometría

    return NextResponse.json({
      success: true,
      onboarding: {
        completed: user.onboardingCompleted,
        currentStep: Math.max(user.onboardingStep, computedStep),
        userName: user.name,
        progress: {
          hasSelf: !!user.name,
          hasProject: hasProjects > 0,
          hasRelationship: hasRelationships > 0,
          projectCount: hasProjects,
          relationshipCount: hasRelationships,
          intentionCount: hasIntentions,
        },
      },
    });

  } catch (error) {
    console.error('Error en GET /api/user/onboarding:', error);
    return NextResponse.json(
      { error: 'Error al obtener onboarding', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST - Actualizar paso del onboarding
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { step, completed, userName } = body;

    const updateData: any = {};

    if (typeof step === 'number') {
      updateData.onboardingStep = step;
    }

    if (typeof completed === 'boolean') {
      updateData.onboardingCompleted = completed;
    }

    if (userName && typeof userName === 'string') {
      updateData.name = userName;
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        onboardingCompleted: true,
        onboardingStep: true,
        name: true,
      },
    });

    return NextResponse.json({
      success: true,
      onboarding: {
        completed: user.onboardingCompleted,
        currentStep: user.onboardingStep,
        userName: user.name,
      },
    });

  } catch (error) {
    console.error('Error en POST /api/user/onboarding:', error);
    return NextResponse.json(
      { error: 'Error al actualizar onboarding', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT - Completar onboarding
export async function PUT() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompleted: true,
        onboardingStep: 5,
      },
    });

    // Crear snapshot inicial de todos los nodos del usuario
    const snapshotsCreated = await createFullSnapshot(session.user.id);

    return NextResponse.json({
      success: true,
      message: '¡Onboarding completado! Bienvenido a OBSERVADOR4D',
      onboarding: {
        completed: user.onboardingCompleted,
        currentStep: user.onboardingStep,
      },
      snapshots: {
        created: snapshotsCreated,
        message: `Se crearon ${snapshotsCreated} snapshots iniciales para tu Timeline`,
      },
    });

  } catch (error) {
    console.error('Error en PUT /api/user/onboarding:', error);
    return NextResponse.json(
      { error: 'Error al completar onboarding', details: (error as Error).message },
      { status: 500 }
    );
  }
}

