import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/external/ingest
// Endpoint para que proyectos externos envíen datos de sus agentes
// Autenticación por API Key (header X-API-Key)
// ═══════════════════════════════════════════════════════════════════════════

interface IngestPayload {
  // Datos de la decisión
  contextType: string;        // "pricing_request", "risk_assessment", etc.
  inputSummary?: string;      // Resumen legible
  inputValue?: any;           // Datos raw
  
  actionTaken: string;        // "increase_price", "approve_payment", etc.
  actionLabel?: string;       // Etiqueta legible
  outputValue?: any;          // Detalles de salida
  
  // Resultado
  outcome?: string;           // "accepted", "rejected", "pending"
  revenueGenerated?: number;  // Dinero generado
  
  // Metadata del agente
  agentName?: string;
  agentVersion?: string;
  riskLevel?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Obtener API Key del header
    const apiKey = request.headers.get('X-API-Key') || request.headers.get('x-api-key');
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'API Key requerida',
          hint: 'Incluye el header X-API-Key con tu clave de proyecto'
        },
        { status: 401 }
      );
    }
    
    // Buscar proyecto por API Key
    const project = await prisma.externalProject.findUnique({
      where: { apiKey }
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'API Key inválida' },
        { status: 401 }
      );
    }
    
    // Verificar estado del proyecto
    if (project.status !== 'active') {
      return NextResponse.json(
        { 
          error: 'Proyecto inactivo',
          status: project.status,
          message: 'Activa el proyecto desde el panel de OBSERVADOR4D'
        },
        { status: 403 }
      );
    }
    
    // Verificar modo de agentes
    if (project.agentMode === 'paused') {
      return NextResponse.json(
        { 
          error: 'Agentes pausados',
          agentMode: project.agentMode,
          message: 'Los agentes de este proyecto están pausados. Reactívalos desde el panel.'
        },
        { status: 403 }
      );
    }
    
    const payload: IngestPayload = await request.json();
    
    // Validar campos requeridos
    if (!payload.contextType || !payload.actionTaken) {
      return NextResponse.json(
        { 
          error: 'Campos requeridos faltantes',
          required: ['contextType', 'actionTaken'],
          received: Object.keys(payload)
        },
        { status: 400 }
      );
    }
    
    // Calcular impacto en coherencia
    let coherenceImpact = 0;
    
    if (payload.revenueGenerated && payload.revenueGenerated > 0) {
      coherenceImpact = Math.min(0.1, payload.revenueGenerated / 1000);
    }
    if (payload.outcome === 'rejected') {
      coherenceImpact = -0.05;
    }
    if (payload.outcome === 'accepted') {
      coherenceImpact += 0.02;
    }
    if (payload.riskLevel && payload.riskLevel > 0.7) {
      coherenceImpact -= 0.03;
    }
    
    // Crear registro de decisión
    const decision = await prisma.externalDecision.create({
      data: {
        projectId: project.id,
        contextType: payload.contextType,
        inputSummary: payload.inputSummary,
        inputValue: payload.inputValue || {},
        actionTaken: payload.actionTaken,
        actionLabel: payload.actionLabel || payload.actionTaken.replace(/_/g, ' '),
        outputValue: payload.outputValue || {},
        outcome: payload.outcome,
        revenueGenerated: payload.revenueGenerated || 0,
        coherenceImpact,
        riskLevel: payload.riskLevel,
        agentName: payload.agentName,
        agentVersion: payload.agentVersion,
      }
    });
    
    // Actualizar métricas del proyecto
    const revenueToAdd = payload.revenueGenerated || 0;
    
    await prisma.externalProject.update({
      where: { id: project.id },
      data: {
        currentBalance: { increment: revenueToAdd },
        totalRevenue: { increment: revenueToAdd },
        monthlyRevenue: { increment: revenueToAdd },
        lastTransactionAt: revenueToAdd > 0 ? new Date() : undefined,
        transactionsCount: { increment: 1 },
      }
    });
    
    return NextResponse.json({
      success: true,
      decisionId: decision.id,
      project: project.name,
      coherenceImpact: Math.round(coherenceImpact * 100) / 100,
      message: 'Decisión registrada',
      timestamp: decision.timestamp.toISOString(),
    });
    
  } catch (error) {
    console.error('Error in /api/external/ingest:', error);
    return NextResponse.json(
      { error: 'Error interno', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET /api/external/ingest - Documentación
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/external/ingest',
    method: 'POST',
    description: 'Envía decisiones de agentes de IA desde proyectos externos',
    
    authentication: {
      type: 'API Key',
      header: 'X-API-Key',
      howToGet: 'Crea un proyecto en OBSERVADOR4D > Projects Hub > Nuevo Proyecto',
    },
    
    requiredFields: {
      contextType: 'string - Tipo de contexto (pricing_request, risk_assessment, payment, etc.)',
      actionTaken: 'string - Acción tomada (increase_price, block_user, etc.)',
    },
    
    optionalFields: {
      inputSummary: 'string - Resumen del input',
      inputValue: 'object - Datos de entrada',
      actionLabel: 'string - Etiqueta legible',
      outputValue: 'object - Datos de salida',
      outcome: 'string - accepted, rejected, pending',
      revenueGenerated: 'number - Dinero generado',
      agentName: 'string - Nombre del agente',
      agentVersion: 'string - Versión',
      riskLevel: 'number - 0-1',
    },
    
    example: {
      curl: `curl -X POST https://4d-observador-macro.vercel.app/api/external/ingest \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: obs_xxxxxxxx..." \\
  -d '{"contextType":"pricing_request","actionTaken":"increase_price","revenueGenerated":50}'`,
    },
    
    responses: {
      200: 'Decisión registrada',
      400: 'Campos requeridos faltantes',
      401: 'API Key inválida o no proporcionada',
      403: 'Proyecto inactivo o agentes pausados',
      500: 'Error interno',
    }
  });
}
