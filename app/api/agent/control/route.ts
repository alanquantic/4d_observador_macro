import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// ═══════════════════════════════════════════════════════════════════════════
// API de Control de Agentes - Kill Switch y gestión de modos
// ═══════════════════════════════════════════════════════════════════════════

// PUT /api/agent/control - Cambiar modo de un proyecto específico
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const { projectId, mode } = await request.json();
    
    if (!projectId || !mode) {
      return NextResponse.json(
        { error: 'Missing projectId or mode' },
        { status: 400 }
      );
    }
    
    if (!['auto', 'manual', 'paused'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Use: auto, manual, or paused' },
        { status: 400 }
      );
    }
    
    // Verificar propiedad del proyecto
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id }
    });
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
    }
    
    const previousMode = project.agentMode;
    
    // Actualizar modo
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { agentMode: mode }
    });
    
    // Registrar esta acción como una decisión manual (para el log)
    await prisma.agentDecision.create({
      data: {
        projectId,
        contextType: 'manual_override',
        actionTaken: `mode_change_${previousMode}_to_${mode}`,
        actionLabel: `Modo cambiado: ${previousMode.toUpperCase()} → ${mode.toUpperCase()}`,
        agentName: 'Human-Operator',
        outcome: 'executed',
        coherenceImpact: mode === 'paused' ? -0.02 : (mode === 'auto' ? 0.02 : 0),
      }
    });
    
    return NextResponse.json({
      success: true,
      project: {
        id: updated.id,
        name: updated.name,
        previousMode,
        newMode: mode,
      },
      message: `Agent mode changed from ${previousMode} to ${mode}`,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error in PUT /api/agent/control:', error);
    return NextResponse.json(
      { error: 'Error al controlar agentes', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/agent/control - Acciones globales (Emergency Stop / Resume All)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const { action } = await request.json();
    
    if (!action) {
      return NextResponse.json(
        { error: 'Missing action. Use: EMERGENCY_STOP or RESUME_ALL' },
        { status: 400 }
      );
    }
    
    const userId = session.user.id;
    
    if (action === 'EMERGENCY_STOP') {
      // Obtener proyectos que no están pausados
      const activeProjects = await prisma.project.findMany({
        where: { 
          userId,
          agentMode: { not: 'paused' }
        },
        select: { id: true, name: true, agentMode: true }
      });
      
      // Pausar todos los proyectos del usuario
      await prisma.project.updateMany({
        where: { userId },
        data: { agentMode: 'paused' }
      });
      
      // Registrar en cada proyecto
      for (const project of activeProjects) {
        await prisma.agentDecision.create({
          data: {
            projectId: project.id,
            contextType: 'emergency_stop',
            actionTaken: 'emergency_pause_all',
            actionLabel: '🛑 EMERGENCY STOP - Todos los agentes pausados',
            agentName: 'Human-Operator',
            outcome: 'executed',
            coherenceImpact: -0.05,
            riskLevel: 1.0,
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        action: 'EMERGENCY_STOP',
        affectedProjects: activeProjects.length,
        projects: activeProjects.map(p => ({ id: p.id, name: p.name, previousMode: p.agentMode })),
        message: '🛑 EMERGENCY STOP: All agents paused',
        timestamp: new Date().toISOString(),
      });
    }
    
    if (action === 'RESUME_ALL') {
      // Obtener proyectos pausados
      const pausedProjects = await prisma.project.findMany({
        where: { 
          userId,
          agentMode: 'paused'
        },
        select: { id: true, name: true }
      });
      
      // Reanudar todos a modo auto
      await prisma.project.updateMany({
        where: { userId },
        data: { agentMode: 'auto' }
      });
      
      // Registrar en cada proyecto
      for (const project of pausedProjects) {
        await prisma.agentDecision.create({
          data: {
            projectId: project.id,
            contextType: 'resume_operations',
            actionTaken: 'resume_to_auto',
            actionLabel: '✅ Operaciones reanudadas - Modo AUTO',
            agentName: 'Human-Operator',
            outcome: 'executed',
            coherenceImpact: 0.03,
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        action: 'RESUME_ALL',
        affectedProjects: pausedProjects.length,
        projects: pausedProjects.map(p => ({ id: p.id, name: p.name })),
        message: '✅ All agents resumed to AUTO mode',
        timestamp: new Date().toISOString(),
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action. Use: EMERGENCY_STOP or RESUME_ALL' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error in POST /api/agent/control:', error);
    return NextResponse.json(
      { error: 'Emergency control failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET /api/agent/control - Estado actual de todos los agentes
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        agentMode: true,
        activeAgents: true,
        currentBalance: true,
        status: true,
      },
      orderBy: { name: 'asc' }
    });
    
    const summary = {
      total: projects.length,
      auto: projects.filter(p => p.agentMode === 'auto').length,
      manual: projects.filter(p => p.agentMode === 'manual').length,
      paused: projects.filter(p => p.agentMode === 'paused').length,
    };
    
    return NextResponse.json({
      success: true,
      summary,
      projects,
      availableActions: ['EMERGENCY_STOP', 'RESUME_ALL'],
      availableModes: ['auto', 'manual', 'paused'],
    });
    
  } catch (error) {
    console.error('Error in GET /api/agent/control:', error);
    return NextResponse.json(
      { error: 'Error al obtener estado', details: (error as Error).message },
      { status: 500 }
    );
  }
}
