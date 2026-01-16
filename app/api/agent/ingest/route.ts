import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// ═══════════════════════════════════════════════════════════════════════════
// POST /api/agent/ingest
// Endpoint para que proyectos externos (Legal Shield, Capital Miner, etc.)
// envíen las decisiones de sus agentes de IA
// ═══════════════════════════════════════════════════════════════════════════

interface AgentIngestPayload {
  projectId: string;          // ID del proyecto en OBSERVADOR4D
  apiKey?: string;            // API key para autenticación (futuro)
  
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
    const payload: AgentIngestPayload = await request.json();
    
    // Validar campos requeridos
    if (!payload.projectId || !payload.contextType || !payload.actionTaken) {
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          required: ['projectId', 'contextType', 'actionTaken'],
          received: payload 
        },
        { status: 400 }
      );
    }
    
    // Verificar que el proyecto existe
    const project = await prisma.project.findUnique({
      where: { id: payload.projectId }
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found', projectId: payload.projectId },
        { status: 404 }
      );
    }
    
    // Si el proyecto está en modo "paused", rechazar nuevas decisiones
    if (project.agentMode === 'paused') {
      return NextResponse.json(
        { 
          error: 'Project agents are paused',
          projectId: payload.projectId,
          agentMode: project.agentMode,
          message: 'Enable agents to accept new decisions'
        },
        { status: 403 }
      );
    }
    
    // Calcular impacto en coherencia basado en la decisión
    let coherenceImpact = 0;
    
    // Ingresos positivos mejoran coherencia
    if (payload.revenueGenerated && payload.revenueGenerated > 0) {
      coherenceImpact = Math.min(0.1, payload.revenueGenerated / 1000);
    }
    
    // Rechazos bajan coherencia
    if (payload.outcome === 'rejected') {
      coherenceImpact = -0.05;
    }
    
    // Alto riesgo baja coherencia
    if (payload.riskLevel && payload.riskLevel > 0.7) {
      coherenceImpact -= 0.03;
    }
    
    // Decisiones exitosas aumentan coherencia
    if (payload.outcome === 'accepted') {
      coherenceImpact += 0.02;
    }
    
    // Crear registro de decisión
    const decision = await prisma.agentDecision.create({
      data: {
        projectId: payload.projectId,
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
    
    await prisma.project.update({
      where: { id: payload.projectId },
      data: {
        currentBalance: { increment: revenueToAdd },
        totalRevenue: { increment: revenueToAdd },
        monthlyRevenue: { increment: revenueToAdd },
        lastTransactionAt: revenueToAdd > 0 ? new Date() : undefined,
        transactionsPerHour: { increment: 1 },
      }
    });
    
    return NextResponse.json({
      success: true,
      decisionId: decision.id,
      projectName: project.name,
      coherenceImpact: Math.round(coherenceImpact * 100) / 100,
      newBalance: project.currentBalance + revenueToAdd,
      message: 'Decision ingested successfully',
      timestamp: decision.timestamp,
    });
    
  } catch (error) {
    console.error('Error in /api/agent/ingest:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET /api/agent/ingest - Documentación del endpoint
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/agent/ingest',
    method: 'POST',
    description: 'Ingest agent decisions from external projects (Legal Shield, Capital Miner, etc.)',
    
    requiredFields: {
      projectId: 'string - ID del proyecto en OBSERVADOR4D',
      contextType: 'string - Tipo de contexto (pricing_request, risk_assessment, payment_processed, etc.)',
      actionTaken: 'string - Acción tomada (increase_price, block_user, approve_payment, etc.)',
    },
    
    optionalFields: {
      inputSummary: 'string - Resumen legible del input',
      inputValue: 'object - Datos raw de entrada',
      actionLabel: 'string - Etiqueta legible de la acción',
      outputValue: 'object - Detalles de la salida',
      outcome: 'string - Resultado (accepted, rejected, pending, ignored)',
      revenueGenerated: 'number - Dinero generado por esta decisión',
      agentName: 'string - Nombre del agente de IA',
      agentVersion: 'string - Versión del modelo',
      riskLevel: 'number - Nivel de riesgo 0-1',
    },
    
    examplePayload: {
      projectId: 'clxxx...',
      contextType: 'pricing_request',
      inputSummary: 'Contrato #882 - Análisis de riesgo alto',
      actionTaken: 'increase_price',
      actionLabel: 'Precio ajustado +40%',
      outputValue: { price: 50.00, currency: 'USD', strategy: 'high_risk' },
      revenueGenerated: 50.00,
      outcome: 'accepted',
      agentName: 'LegalShield-PricingAgent',
      agentVersion: '2.1.0',
      riskLevel: 0.7
    },
    
    responses: {
      200: 'Decision ingested successfully',
      400: 'Missing required fields',
      403: 'Project agents are paused',
      404: 'Project not found',
      500: 'Internal server error'
    }
  });
}
