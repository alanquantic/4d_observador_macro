import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════
// API de Proyectos Externos (Legal Shield, Capital Miner, etc.)
// Permite registrar, gestionar y obtener credenciales de integración
// ═══════════════════════════════════════════════════════════════════════════

// Generar API Key segura
function generateApiKey(prefix: string = 'obs'): { key: string; prefix: string } {
  const randomPart = crypto.randomBytes(24).toString('base64url');
  const key = `${prefix}_${randomPart}`;
  const keyPrefix = `${prefix}_${randomPart.substring(0, 8)}...`;
  return { key, prefix: keyPrefix };
}

// GET /api/external-projects - Listar proyectos externos del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const projects = await prisma.externalProject.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { decisions: true }
        }
      }
    });
    
    // Ocultar la API key completa, solo mostrar el prefix
    const safeProjects = projects.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      projectType: p.projectType,
      apiKeyPrefix: p.apiKeyPrefix,
      webhookUrl: p.webhookUrl,
      status: p.status,
      agentMode: p.agentMode,
      currentBalance: p.currentBalance,
      totalRevenue: p.totalRevenue,
      monthlyRevenue: p.monthlyRevenue,
      lastTransactionAt: p.lastTransactionAt,
      transactionsCount: p.transactionsCount,
      decisionsCount: p._count.decisions,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    
    return NextResponse.json({
      success: true,
      projects: safeProjects,
      count: projects.length,
    });
    
  } catch (error) {
    console.error('Error in GET /api/external-projects:', error);
    return NextResponse.json(
      { error: 'Error al obtener proyectos', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/external-projects - Crear nuevo proyecto externo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, description, projectType, webhookUrl } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'El nombre del proyecto es requerido' },
        { status: 400 }
      );
    }
    
    // Generar API Key única
    const { key: apiKey, prefix: apiKeyPrefix } = generateApiKey('obs');
    
    const project = await prisma.externalProject.create({
      data: {
        userId: session.user.id,
        name,
        description: description || null,
        projectType: projectType || 'ai_agent',
        apiKey,
        apiKeyPrefix,
        webhookUrl: webhookUrl || null,
      }
    });
    
    // Devolver con la API key completa SOLO en la creación
    return NextResponse.json({
      success: true,
      message: '¡Proyecto creado! Guarda la API Key, no se mostrará de nuevo.',
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        projectType: project.projectType,
        status: project.status,
        agentMode: project.agentMode,
        createdAt: project.createdAt,
      },
      // ⚠️ La API key completa solo se muestra una vez
      credentials: {
        projectId: project.id,
        apiKey: apiKey, // ¡GUARDAR ESTO!
        apiKeyPrefix: apiKeyPrefix,
        ingestEndpoint: '/api/external/ingest',
      },
      integration: {
        endpoint: `${process.env.NEXTAUTH_URL || 'https://4d-observador-macro.vercel.app'}/api/external/ingest`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        examplePayload: {
          contextType: 'pricing_request',
          actionTaken: 'increase_price',
          actionLabel: 'Precio ajustado +40%',
          revenueGenerated: 50.00,
          outcome: 'accepted',
          agentName: `${name}-Agent`,
          riskLevel: 0.5
        }
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error in POST /api/external-projects:', error);
    return NextResponse.json(
      { error: 'Error al crear proyecto', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT /api/external-projects - Actualizar proyecto (status, agentMode, etc.)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const body = await request.json();
    const { projectId, name, description, status, agentMode, webhookUrl, regenerateKey } = body;
    
    if (!projectId) {
      return NextResponse.json({ error: 'projectId requerido' }, { status: 400 });
    }
    
    // Verificar propiedad
    const existing = await prisma.externalProject.findFirst({
      where: { id: projectId, userId: session.user.id }
    });
    
    if (!existing) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }
    
    // Preparar datos de actualización
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (agentMode !== undefined) updateData.agentMode = agentMode;
    if (webhookUrl !== undefined) updateData.webhookUrl = webhookUrl;
    
    // Si se solicita regenerar la API key
    let newCredentials = null;
    if (regenerateKey) {
      const { key: apiKey, prefix: apiKeyPrefix } = generateApiKey('obs');
      updateData.apiKey = apiKey;
      updateData.apiKeyPrefix = apiKeyPrefix;
      newCredentials = { apiKey, apiKeyPrefix };
    }
    
    const updated = await prisma.externalProject.update({
      where: { id: projectId },
      data: updateData,
    });
    
    const response: any = {
      success: true,
      project: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        status: updated.status,
        agentMode: updated.agentMode,
        apiKeyPrefix: updated.apiKeyPrefix,
      }
    };
    
    if (newCredentials) {
      response.newCredentials = newCredentials;
      response.warning = '⚠️ Nueva API Key generada. La anterior ya no funcionará.';
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error in PUT /api/external-projects:', error);
    return NextResponse.json(
      { error: 'Error al actualizar proyecto', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE /api/external-projects - Eliminar proyecto
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json({ error: 'projectId requerido' }, { status: 400 });
    }
    
    // Verificar propiedad
    const existing = await prisma.externalProject.findFirst({
      where: { id: projectId, userId: session.user.id }
    });
    
    if (!existing) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }
    
    await prisma.externalProject.delete({
      where: { id: projectId }
    });
    
    return NextResponse.json({
      success: true,
      message: `Proyecto "${existing.name}" eliminado`,
    });
    
  } catch (error) {
    console.error('Error in DELETE /api/external-projects:', error);
    return NextResponse.json(
      { error: 'Error al eliminar proyecto', details: (error as Error).message },
      { status: 500 }
    );
  }
}
