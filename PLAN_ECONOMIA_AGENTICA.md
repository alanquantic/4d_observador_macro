# 🌐 PLAN: Integración "Economía Agéntica" en OBSERVADOR4D

**Solicitado por:** Antonio Díaz  
**Fecha:** 12 de Enero, 2026  
**Objetivo:** Transformar OBSERVADOR4D de "Diario Personal" a "God View Agéntico"

---

## 📊 RESUMEN EJECUTIVO

### ¿Qué quiere el cliente?

Convertir OBSERVADOR4D en un **Centro de Comando Unificado** para monitorear y controlar múltiples proyectos con IA que generan ingresos automáticamente.

| Antes (Actual) | Después (Propuesto) |
|----------------|---------------------|
| Mira hacia adentro | Mira hacia afuera |
| Intenciones personales | Decisiones de IA |
| Coherencia emocional | Flujo de dinero |
| Nodos flotando | Sistema Solar con órbitas |
| Solo lectura | Control + Kill Switch |

### Proyectos externos que enviarían datos:
- **Legal Shield** - IA de análisis legal con pricing dinámico
- **Capital Miner** - IA de gestión de liquidez
- **Futuros proyectos** - Cualquier app con agentes de IA

---

## 🏗️ ARQUITECTURA PROPUESTA

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PROYECTOS EXTERNOS CON IA                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │ Legal Shield│  │Capital Miner│  │  Proyecto N │                  │
│  │   (IA)      │  │    (IA)     │  │    (IA)     │                  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                  │
│         │                │                │                          │
│         └────────────────┼────────────────┘                          │
│                          │                                           │
│                          ▼                                           │
│              POST /api/agent/ingest                                  │
│              { projectId, action, revenue, context }                 │
└──────────────────────────┼───────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      OBSERVADOR4D (God View)                         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL (Neon.tech)                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │  │
│  │  │   Project   │◄─┤AgentDecision│  │ Modelos existentes...   │ │  │
│  │  │ +balance    │  │ +revenue    │  │ (Relationship, etc.)    │ │  │
│  │  │ +agents     │  │ +action     │  │                         │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                     VISUALIZACIÓN 3D                            │  │
│  │  ┌─────────────────────────────────────────────────────────┐   │  │
│  │  │            SISTEMA SOLAR LEVIATHAN                       │   │  │
│  │  │                                                          │   │  │
│  │  │    🛰️ Decisión                     🛰️ Decisión           │   │  │
│  │  │        \                             /                   │   │  │
│  │  │         🌍 Legal Shield    🌕 Capital Miner             │   │  │
│  │  │              \               /                           │   │  │
│  │  │               \    ☀️     /                              │   │  │
│  │  │                \  CORE   /                               │   │  │
│  │  │                 \ (Tú) /                                 │   │  │
│  │  │                  \   /                                   │   │  │
│  │  │              ═════════════                               │   │  │
│  │  │               Órbitas                                    │   │  │
│  │  └─────────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                   AGENT COMMAND CENTER                          │  │
│  │  ┌──────────────────────────────────┬────────────────────────┐ │  │
│  │  │        STREAM EN VIVO            │    CONTROLES           │ │  │
│  │  │ [14:05:22] Legal: ⚠️ Riesgo +40% │  ┌────────────────┐    │ │  │
│  │  │ [14:05:25] Capital: 📉 Pausado   │  │ MODO AUTOMÁTICO│    │ │  │
│  │  │ [14:06:10] User: ✅ Pagó $50     │  │    [ON/OFF]    │    │ │  │
│  │  │ [14:07:33] Legal: 💰 +$120       │  └────────────────┘    │ │  │
│  │  └──────────────────────────────────┴────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📝 FASE 1: BACKEND & DATA (Prioridad Alta)

### 1.1 Actualizar Prisma Schema

**Archivo:** `prisma/schema.prisma`

```prisma
// ═══════════════════════════════════════════════════════════════
// NUEVOS MODELOS: Economía Agéntica
// ═══════════════════════════════════════════════════════════════

// Registro de cada decisión que toma una IA externa
model AgentDecision {
  id            String   @id @default(cuid())
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  timestamp     DateTime @default(now())
  
  // Contexto del momento
  contextType   String   // "pricing_request", "risk_assessment", "churn_prediction", "payment_processed"
  inputSummary  String?  // Resumen legible del input (ej: "Contrato #882 - 15 páginas")
  inputValue    Json?    // Datos raw de entrada
  
  // La decisión tomada
  actionTaken   String   // "increase_price", "block_user", "offer_discount", "approve_payment"
  actionLabel   String?  // Etiqueta legible (ej: "Precio ajustado +40%")
  outputValue   Json?    // Detalles de salida { price: 50.00, currency: "USD" }
  
  // Resultado y feedback
  outcome       String?  // "accepted", "rejected", "ignored", "pending"
  revenueGenerated Float @default(0.0) // Dinero generado por esta decisión
  
  // Impacto en la geometría (para Wolcoff)
  coherenceImpact Float? // -1 a 1 (negativo = baja coherencia, positivo = mejora)
  riskLevel       Float? // 0-1 nivel de riesgo de esta decisión
  
  // Metadata
  agentName     String?  // Nombre del agente que tomó la decisión
  agentVersion  String?  // Versión del modelo de IA
  
  createdAt     DateTime @default(now())
  
  @@index([projectId, timestamp])
  @@index([projectId, actionTaken])
  @@index([timestamp])
}

// ═══════════════════════════════════════════════════════════════
// ACTUALIZACIÓN: Modelo Project con campos financieros
// ═══════════════════════════════════════════════════════════════

model Project {
  // ... campos existentes se mantienen ...
  id            String   @id @default(cuid())
  userId        String
  name          String
  description   String?
  category      String?
  status        String   @default("active")
  progress      Float    @default(0.0)
  energyInvested Float   @default(0.0)
  startDate     DateTime @default(now())
  targetDate    DateTime?
  completedDate DateTime?
  objectives    Json?
  nextSteps     Json?
  resources     Json?
  relatedPeople String[]
  impactLevel   Float?
  satisfactionLevel Float?
  
  // ═══════ NUEVOS CAMPOS FINANCIEROS ═══════
  
  // Estado financiero en vivo
  currentBalance    Float   @default(0.0)  // Dinero en caja hoy
  totalRevenue      Float   @default(0.0)  // Ingresos totales acumulados
  monthlyRevenue    Float   @default(0.0)  // Ingresos este mes
  lastTransactionAt DateTime?              // Última transacción
  
  // Estado de agentes
  activeAgents      Int     @default(0)    // Agentes de IA activos
  agentMode         String  @default("auto") // "auto", "manual", "paused"
  
  // Métricas externas
  marketSentiment   Float   @default(0.5)  // 0-1 (Miedo vs Codicia)
  userActivityLevel Float   @default(0.5)  // 0-1 actividad de usuarios
  transactionsPerHour Float @default(0.0)  // Velocidad de transacciones
  
  // Relaciones
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  agentDecisions AgentDecision[]  // NUEVA RELACIÓN
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, status])
}
```

### 1.2 Crear API de Ingesta de Agentes

**Archivo:** `app/api/agent/ingest/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/agent/ingest
// Endpoint para que proyectos externos envíen decisiones de sus agentes

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
        { error: 'Missing required fields: projectId, contextType, actionTaken' },
        { status: 400 }
      );
    }
    
    // Verificar que el proyecto existe
    const project = await prisma.project.findUnique({
      where: { id: payload.projectId }
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Calcular impacto en coherencia (lógica de negocio)
    let coherenceImpact = 0;
    if (payload.revenueGenerated && payload.revenueGenerated > 0) {
      coherenceImpact = Math.min(0.1, payload.revenueGenerated / 1000); // +0.1 max por transacción
    }
    if (payload.outcome === 'rejected') {
      coherenceImpact = -0.05; // Rechazo baja coherencia
    }
    if (payload.riskLevel && payload.riskLevel > 0.7) {
      coherenceImpact -= 0.03; // Alto riesgo baja coherencia
    }
    
    // Crear registro de decisión
    const decision = await prisma.agentDecision.create({
      data: {
        projectId: payload.projectId,
        contextType: payload.contextType,
        inputSummary: payload.inputSummary,
        inputValue: payload.inputValue || {},
        actionTaken: payload.actionTaken,
        actionLabel: payload.actionLabel,
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
        lastTransactionAt: new Date(),
        // Incrementar contador de transacciones (simplificado)
        transactionsPerHour: { increment: 1 },
      }
    });
    
    return NextResponse.json({
      success: true,
      decisionId: decision.id,
      coherenceImpact,
      message: 'Decision ingested successfully'
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
    description: 'Ingest agent decisions from external projects',
    requiredFields: ['projectId', 'contextType', 'actionTaken'],
    optionalFields: [
      'inputSummary', 'inputValue', 'actionLabel', 'outputValue',
      'outcome', 'revenueGenerated', 'agentName', 'agentVersion', 'riskLevel'
    ],
    example: {
      projectId: 'clxxx...',
      contextType: 'pricing_request',
      actionTaken: 'increase_price',
      actionLabel: 'Precio ajustado +40%',
      revenueGenerated: 50.00,
      outcome: 'accepted',
      agentName: 'LegalShield-PricingAgent',
      riskLevel: 0.7
    }
  });
}
```

### 1.3 Crear API de Economía en Vivo

**Archivo:** `app/api/dashboard/live-economy/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/dashboard/live-economy
// Devuelve estado financiero consolidado de todos los proyectos

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Obtener proyectos con sus métricas financieras
    const projects = await prisma.project.findMany({
      where: { userId, status: { in: ['active', 'paused'] } },
      include: {
        agentDecisions: {
          orderBy: { timestamp: 'desc' },
          take: 50, // Últimas 50 decisiones por proyecto
        }
      }
    });
    
    // Calcular métricas globales
    const totalBalance = projects.reduce((sum, p) => sum + (p.currentBalance || 0), 0);
    const totalRevenue = projects.reduce((sum, p) => sum + (p.totalRevenue || 0), 0);
    const monthlyRevenue = projects.reduce((sum, p) => sum + (p.monthlyRevenue || 0), 0);
    const totalActiveAgents = projects.reduce((sum, p) => sum + (p.activeAgents || 0), 0);
    
    // Obtener últimas decisiones globales (para el feed)
    const recentDecisions = await prisma.agentDecision.findMany({
      where: {
        project: { userId }
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
      include: {
        project: {
          select: { name: true }
        }
      }
    });
    
    // Formatear para el frontend
    const formattedDecisions = recentDecisions.map(d => ({
      id: d.id,
      timestamp: d.timestamp,
      projectName: d.project.name,
      agentName: d.agentName || 'Agent',
      actionLabel: d.actionLabel || d.actionTaken,
      contextType: d.contextType,
      outcome: d.outcome,
      revenue: d.revenueGenerated,
      riskLevel: d.riskLevel,
      coherenceImpact: d.coherenceImpact,
    }));
    
    // Calcular salud del sistema basado en coherencia de decisiones
    const avgCoherenceImpact = recentDecisions.length > 0
      ? recentDecisions.reduce((sum, d) => sum + (d.coherenceImpact || 0), 0) / recentDecisions.length
      : 0;
    
    const systemHealth = Math.max(0, Math.min(100, 50 + (avgCoherenceImpact * 500)));
    
    // Proyectos formateados para visualización
    const formattedProjects = projects.map(p => ({
      id: p.id,
      name: p.name,
      balance: p.currentBalance || 0,
      totalRevenue: p.totalRevenue || 0,
      monthlyRevenue: p.monthlyRevenue || 0,
      activeAgents: p.activeAgents || 0,
      agentMode: p.agentMode || 'auto',
      transactionsPerHour: p.transactionsPerHour || 0,
      marketSentiment: p.marketSentiment || 0.5,
      userActivityLevel: p.userActivityLevel || 0.5,
      lastTransaction: p.lastTransactionAt,
      recentDecisionsCount: p.agentDecisions.length,
      // Para visualización orbital
      orbitRadius: 25 + (p.totalRevenue || 0) / 1000, // Más ingresos = órbita más lejana
      orbitSpeed: Math.min(2, (p.transactionsPerHour || 0) / 10), // Más transacciones = más rápido
      planetSize: 1.5 + Math.log10((p.totalRevenue || 0) + 1) * 0.5, // Tamaño logarítmico
    }));
    
    return NextResponse.json({
      success: true,
      
      // Métricas globales
      global: {
        totalBalance,
        totalRevenue,
        monthlyRevenue,
        totalActiveAgents,
        systemHealth,
        projectCount: projects.length,
      },
      
      // Proyectos para el Sistema Solar
      projects: formattedProjects,
      
      // Feed de decisiones recientes
      recentDecisions: formattedDecisions,
      
      // Timestamp para polling
      lastUpdate: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error in /api/dashboard/live-economy:', error);
    return NextResponse.json(
      { error: 'Error al cargar economía en vivo', details: (error as Error).message },
      { status: 500 }
    );
  }
}
```

### 1.4 API para Control de Agentes (Kill Switch)

**Archivo:** `app/api/agent/control/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// PUT /api/agent/control
// Controlar el modo de los agentes de un proyecto

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
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Actualizar modo
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { agentMode: mode }
    });
    
    // Registrar esta acción como una decisión manual
    await prisma.agentDecision.create({
      data: {
        projectId,
        contextType: 'manual_override',
        actionTaken: `mode_change_to_${mode}`,
        actionLabel: `Modo cambiado a ${mode.toUpperCase()}`,
        agentName: 'Human-Operator',
        coherenceImpact: mode === 'paused' ? -0.05 : 0.02,
      }
    });
    
    return NextResponse.json({
      success: true,
      project: updated.name,
      newMode: mode,
      message: `Agent mode changed to ${mode}`
    });
    
  } catch (error) {
    console.error('Error in /api/agent/control:', error);
    return NextResponse.json(
      { error: 'Error al controlar agentes', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT global - Pausar todos los agentes (Emergency Kill Switch)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const { action } = await request.json();
    
    if (action === 'EMERGENCY_STOP') {
      // Pausar todos los proyectos del usuario
      await prisma.project.updateMany({
        where: { userId: session.user.id },
        data: { agentMode: 'paused' }
      });
      
      return NextResponse.json({
        success: true,
        message: '🛑 EMERGENCY STOP: All agents paused'
      });
    }
    
    if (action === 'RESUME_ALL') {
      await prisma.project.updateMany({
        where: { userId: session.user.id },
        data: { agentMode: 'auto' }
      });
      
      return NextResponse.json({
        success: true,
        message: '✅ All agents resumed to AUTO mode'
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Error in emergency control:', error);
    return NextResponse.json({ error: 'Emergency control failed' }, { status: 500 });
  }
}
```

---

## 📝 FASE 2: VISUALIZACIÓN 3D - SISTEMA SOLAR

### 2.1 Nuevo Modo de Visualización en Scene3D

**Archivo:** `components/tablero3d/Scene3D.tsx` - AGREGAR

```typescript
// ═══════════════════════════════════════════════════════════════
// NUEVO: Sistema Solar Leviathan (Modo Economía)
// ═══════════════════════════════════════════════════════════════

interface EconomyProject {
  id: string;
  name: string;
  orbitRadius: number;
  orbitSpeed: number;
  planetSize: number;
  balance: number;
  activeAgents: number;
  agentMode: string;
}

const createSolarSystem = (
  scene: BABYLON.Scene,
  projects: EconomyProject[],
  shadowGenerator: BABYLON.ShadowGenerator
) => {
  const planets: BABYLON.Mesh[] = [];
  const orbits: BABYLON.Mesh[] = [];
  
  // ═══════ SOL CENTRAL (Usuario/Core) ═══════
  const sun = BABYLON.MeshBuilder.CreateSphere('sun_core', {
    diameter: 8,
    segments: 64
  }, scene);
  sun.position = new BABYLON.Vector3(0, 30, 0);
  
  const sunMaterial = new BABYLON.StandardMaterial('sun_mat', scene);
  sunMaterial.emissiveColor = new BABYLON.Color3(1, 0.8, 0.2); // Dorado
  sunMaterial.diffuseColor = new BABYLON.Color3(1, 0.9, 0.3);
  sun.material = sunMaterial;
  
  // Glow del sol
  const sunGlow = BABYLON.MeshBuilder.CreateSphere('sun_glow', {
    diameter: 12,
    segments: 32
  }, scene);
  sunGlow.position = sun.position.clone();
  const sunGlowMat = new BABYLON.StandardMaterial('sun_glow_mat', scene);
  sunGlowMat.emissiveColor = new BABYLON.Color3(1, 0.7, 0.1);
  sunGlowMat.alpha = 0.3;
  sunGlow.material = sunGlowMat;
  
  // ═══════ PLANETAS (Proyectos) ═══════
  projects.forEach((project, index) => {
    // Crear planeta
    const planet = BABYLON.MeshBuilder.CreateSphere(
      `planet_${project.id}`,
      { diameter: project.planetSize, segments: 32 },
      scene
    );
    
    // Posición inicial en órbita
    const angle = (2 * Math.PI * index) / projects.length;
    planet.position = new BABYLON.Vector3(
      project.orbitRadius * Math.cos(angle),
      30, // Misma altura que el sol
      project.orbitRadius * Math.sin(angle)
    );
    
    // Material según estado
    const planetMat = new BABYLON.StandardMaterial(`planet_${project.id}_mat`, scene);
    if (project.agentMode === 'paused') {
      planetMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5); // Gris si pausado
    } else {
      // Color basado en balance (más dinero = más dorado)
      const goldFactor = Math.min(1, project.balance / 10000);
      planetMat.diffuseColor = new BABYLON.Color3(
        0.3 + goldFactor * 0.7,
        0.2 + goldFactor * 0.6,
        0.8 - goldFactor * 0.6
      );
    }
    planetMat.emissiveColor = planetMat.diffuseColor.scale(0.3);
    planet.material = planetMat;
    
    // Crear órbita visual
    const orbit = BABYLON.MeshBuilder.CreateTorus(
      `orbit_${project.id}`,
      { diameter: project.orbitRadius * 2, thickness: 0.1, tessellation: 64 },
      scene
    );
    orbit.position.y = 30;
    orbit.rotation.x = Math.PI / 2;
    const orbitMat = new BABYLON.StandardMaterial(`orbit_${project.id}_mat`, scene);
    orbitMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.3);
    orbitMat.alpha = 0.3;
    orbit.material = orbitMat;
    
    // Guardar metadata
    planet.metadata = { project, orbitRadius: project.orbitRadius, angle, speed: project.orbitSpeed };
    
    planets.push(planet);
    orbits.push(orbit);
    
    // Sombras
    shadowGenerator.addShadowCaster(planet);
  });
  
  // ═══════ ANIMACIÓN DE ÓRBITAS ═══════
  scene.registerBeforeRender(() => {
    planets.forEach(planet => {
      if (planet.metadata) {
        const { orbitRadius, speed } = planet.metadata;
        planet.metadata.angle += speed * 0.01;
        
        planet.position.x = orbitRadius * Math.cos(planet.metadata.angle);
        planet.position.z = orbitRadius * Math.sin(planet.metadata.angle);
      }
    });
    
    // Pulsar el sol
    const time = performance.now() * 0.001;
    const scale = 1 + Math.sin(time) * 0.02;
    sun.scaling = new BABYLON.Vector3(scale, scale, scale);
  });
  
  return { sun, planets, orbits };
};
```

### 2.2 Actualizar Node3D con propiedades financieras

**Modificar:** `components/tablero3d/Node3D.ts`

```typescript
// AGREGAR al interface NodeData:
export interface NodeData {
  // ... campos existentes ...
  
  // NUEVOS: Datos financieros
  revenue?: number;        // Ingresos del nodo
  activityLevel?: number;  // 0-1 actividad reciente
  agentMode?: string;      // "auto", "manual", "paused"
  transactionsPerHour?: number;
}

// MODIFICAR en la animación (registerBeforeRender):
// Si activityLevel es alto, el nodo pulsa más rápido
const pulseSpeed = 1 + (nodeData.activityLevel || 0) * 3;
const pulseScale = 1 + Math.sin(time * pulseSpeed) * 0.1;

// Si hay muchas transacciones, agregar partículas de "rayos"
if (nodeData.transactionsPerHour && nodeData.transactionsPerHour > 5) {
  // Efecto de rayos saliendo del nodo
  const rayIntensity = Math.min(1, nodeData.transactionsPerHour / 20);
  glowMat.alpha = 0.2 + rayIntensity * 0.3;
}
```

---

## 📝 FASE 3: UI - AGENT COMMAND CENTER

### 3.1 Componente AgentCommandCenter

**Archivo:** `components/dashboard/AgentCommandCenter.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Activity, AlertTriangle, DollarSign, Zap, 
  Pause, Play, RefreshCw, Shield 
} from 'lucide-react';

interface AgentDecision {
  id: string;
  timestamp: string;
  projectName: string;
  agentName: string;
  actionLabel: string;
  contextType: string;
  outcome: string | null;
  revenue: number;
  riskLevel: number | null;
}

interface EconomyData {
  global: {
    totalBalance: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalActiveAgents: number;
    systemHealth: number;
  };
  recentDecisions: AgentDecision[];
  projects: any[];
}

export function AgentCommandCenter() {
  const [data, setData] = useState<EconomyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoMode, setAutoMode] = useState(true);
  const [isPolling, setIsPolling] = useState(true);

  // Polling cada 5 segundos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard/live-economy');
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching economy data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    if (isPolling) {
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [isPolling]);

  const handleEmergencyStop = async () => {
    if (confirm('⚠️ ¿Pausar TODOS los agentes?')) {
      await fetch('/api/agent/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'EMERGENCY_STOP' })
      });
      setAutoMode(false);
    }
  };

  const handleResumeAll = async () => {
    await fetch('/api/agent/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'RESUME_ALL' })
    });
    setAutoMode(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getDecisionIcon = (contextType: string, outcome: string | null) => {
    if (outcome === 'rejected') return '❌';
    if (outcome === 'accepted') return '✅';
    if (contextType.includes('risk')) return '⚠️';
    if (contextType.includes('price')) return '💰';
    if (contextType.includes('payment')) return '💵';
    return '🤖';
  };

  if (loading) {
    return (
      <Card className="bg-slate-900/80 border-cyan-500/30">
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-cyan-400" />
          <p className="mt-2 text-slate-400">Conectando con agentes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-cyan-900/20 border-cyan-500/30 backdrop-blur-sm">
      <CardHeader className="border-b border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Agent Command Center
              </CardTitle>
              <p className="text-xs text-slate-400">
                {isPolling ? '🟢 En vivo' : '🔴 Pausado'} • Última actualización: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          {/* Kill Switch */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">MODO AUTO</span>
              <Switch
                checked={autoMode}
                onCheckedChange={(checked) => {
                  if (checked) handleResumeAll();
                  else handleEmergencyStop();
                }}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEmergencyStop}
              className="bg-red-600 hover:bg-red-700"
            >
              <Pause className="h-4 w-4 mr-1" />
              STOP
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Métricas Globales */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-xs text-slate-400">Balance Total</span>
            </div>
            <p className="text-xl font-bold text-green-400">
              {formatCurrency(data?.global.totalBalance || 0)}
            </p>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-xs text-slate-400">Este Mes</span>
            </div>
            <p className="text-xl font-bold text-yellow-400">
              {formatCurrency(data?.global.monthlyRevenue || 0)}
            </p>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-slate-400">Agentes Activos</span>
            </div>
            <p className="text-xl font-bold text-cyan-400">
              {data?.global.totalActiveAgents || 0}
            </p>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-slate-400">Salud Sistema</span>
            </div>
            <p className={`text-xl font-bold ${
              (data?.global.systemHealth || 0) > 70 ? 'text-green-400' :
              (data?.global.systemHealth || 0) > 40 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {Math.round(data?.global.systemHealth || 0)}%
            </p>
          </div>
        </div>
        
        {/* Stream de Decisiones */}
        <div className="bg-black/50 rounded-lg border border-cyan-500/20 overflow-hidden">
          <div className="bg-slate-800/50 px-4 py-2 border-b border-cyan-500/20 flex items-center justify-between">
            <span className="text-sm font-mono text-cyan-400">📡 STREAM DE DECISIONES</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPolling(!isPolling)}
              className="text-xs"
            >
              {isPolling ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
          </div>
          
          <div className="h-64 overflow-y-auto font-mono text-sm p-4 space-y-2">
            {data?.recentDecisions.slice(0, 30).map((decision) => (
              <div 
                key={decision.id}
                className={`flex items-start gap-3 p-2 rounded ${
                  decision.riskLevel && decision.riskLevel > 0.7 
                    ? 'bg-red-500/10 border-l-2 border-red-500' 
                    : decision.revenue > 0 
                    ? 'bg-green-500/10 border-l-2 border-green-500'
                    : 'bg-slate-800/30'
                }`}
              >
                <span className="text-slate-500 w-20 flex-shrink-0">
                  [{formatTime(decision.timestamp)}]
                </span>
                <span className="text-cyan-400 w-24 flex-shrink-0">
                  {decision.projectName}:
                </span>
                <span className="flex-1">
                  {getDecisionIcon(decision.contextType, decision.outcome)}{' '}
                  <span className="text-slate-300">{decision.actionLabel}</span>
                  {decision.revenue > 0 && (
                    <span className="text-green-400 ml-2">
                      +{formatCurrency(decision.revenue)}
                    </span>
                  )}
                </span>
              </div>
            ))}
            
            {(!data?.recentDecisions || data.recentDecisions.length === 0) && (
              <p className="text-slate-500 text-center py-8">
                No hay decisiones recientes. Los agentes están esperando...
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3.2 Integrar en Dashboard

**Modificar:** `components/dashboard/dashboard-content.tsx`

```typescript
// Agregar import
import { AgentCommandCenter } from './AgentCommandCenter';

// En el JSX, agregar después del GameBoard:
<div className="mb-6">
  <AgentCommandCenter />
</div>
```

---

## 📋 RESUMEN DE ARCHIVOS A CREAR/MODIFICAR

### NUEVOS ARCHIVOS:
| Archivo | Propósito |
|---------|-----------|
| `app/api/agent/ingest/route.ts` | Recibir datos de agentes externos |
| `app/api/agent/control/route.ts` | Kill Switch y control de modos |
| `app/api/dashboard/live-economy/route.ts` | Estado financiero en vivo |
| `components/dashboard/AgentCommandCenter.tsx` | Panel de comando de agentes |

### ARCHIVOS A MODIFICAR:
| Archivo | Cambios |
|---------|---------|
| `prisma/schema.prisma` | +AgentDecision model, +campos en Project |
| `components/tablero3d/Scene3D.tsx` | +createSolarSystem() |
| `components/tablero3d/Node3D.ts` | +propiedades financieras |
| `components/dashboard/dashboard-content.tsx` | +AgentCommandCenter |

---

## ⏱️ ESTIMACIÓN DE TIEMPO

| Fase | Tiempo | Prioridad |
|------|--------|-----------|
| FASE 1: Backend | 4-6 horas | 🔴 ALTA |
| FASE 2: Visualización | 6-8 horas | 🟠 MEDIA |
| FASE 3: UI | 3-4 horas | 🟠 MEDIA |
| **TOTAL** | **13-18 horas** | |

---

## 🤔 PREGUNTAS PARA EL CLIENTE

Antes de implementar, necesitamos clarificar:

1. **Autenticación de API Ingest:**
   - ¿Los proyectos externos (Legal Shield, etc.) usarán API keys?
   - ¿O validamos por IP/dominio?

2. **Datos en tiempo real:**
   - ¿Polling cada 5s es suficiente?
   - ¿O necesitamos WebSockets para verdadero tiempo real?

3. **Proyectos externos:**
   - ¿Ya existen Legal Shield y Capital Miner?
   - ¿O son proyectos futuros?
   - ¿Tienen APIs que podamos conectar?

4. **Permisos:**
   - ¿Solo el dueño del proyecto puede ver el Command Center?
   - ¿O habrá roles (admin, viewer)?

---

*Plan creado el 12 de Enero, 2026*
*OBSERVADOR4D → God View Agéntico*
