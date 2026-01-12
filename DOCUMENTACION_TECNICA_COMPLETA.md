# 📚 DOCUMENTACIÓN TÉCNICA COMPLETA - OBSERVADOR4D

**Fecha:** 12 de Enero, 2026  
**Versión:** 1.0  
**Propósito:** Documentación para integración de visualización avanzada

---

## 📦 1. DEPENDENCIAS Y FRAMEWORKS

### package.json

```json
{
  "name": "observador-4d",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "postinstall": "prisma generate",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate deploy"
  },
  "engines": {
    "node": ">=18.17.0"
  }
}
```

### 🔧 Librerías de Visualización ACTIVAS

| Librería | Versión | Uso Actual | Estado |
|----------|---------|------------|--------|
| **@babylonjs/core** | 7.35.0 | ✅ Motor 3D PRINCIPAL del tablero | **ACTIVO** |
| **@babylonjs/loaders** | 7.35.0 | ✅ Cargadores para Babylon.js | **ACTIVO** |
| **three** | 0.161.0 | ⚠️ Instalado pero NO usado | Disponible |
| **@react-three/fiber** | 8.15.16 | ⚠️ Instalado pero NO usado | Disponible |
| **@react-three/drei** | 9.99.0 | ⚠️ Instalado pero NO usado | Disponible |
| **recharts** | 2.12.2 | ✅ Gráficas 2D del dashboard | **ACTIVO** |
| **chart.js** | 4.4.2 | ✅ Gráficas alternativas | **ACTIVO** |
| **react-chartjs-2** | 5.2.0 | ✅ Wrapper React para Chart.js | **ACTIVO** |
| **plotly.js** | 2.35.3 | ✅ Visualizaciones avanzadas | **ACTIVO** |
| **react-plotly.js** | 2.6.0 | ✅ Wrapper React para Plotly | **ACTIVO** |
| **mapbox-gl** | 3.3.0 | 📍 Mapas interactivos | Disponible |

### 🛠️ Stack Principal

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 14.2.28 | Framework principal (App Router) |
| **React** | 18.2.0 | UI Library |
| **TypeScript** | 5.3.3 | Tipado estático |
| **Prisma** | 6.19.1 | ORM para PostgreSQL |
| **NextAuth.js** | 4.24.11 | Autenticación |
| **Tailwind CSS** | 3.4.1 | Estilos |
| **Framer Motion** | 11.0.8 | Animaciones |
| **Radix UI** | Varios | Componentes accesibles |
| **Zustand** | 4.5.2 | Estado global |
| **Jotai** | 2.6.4 | Estado atómico |
| **React Query** | 5.17.19 | Cache de datos |
| **SWR** | 2.2.5 | Fetching de datos |

### 🤖 Inteligencia Artificial

| Librería | Versión | Uso |
|----------|---------|-----|
| **@google/genai** | 1.0.0 | Google Gemini 2.0 Flash |

---

## ⚙️ 2. CONFIGURACIÓN DEL ENTORNO

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es2020",
    "lib": ["dom", "dom.iterable", "es5", "es2020"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

**Notas importantes:**
- Path alias `@/*` apunta a la raíz del proyecto
- Target ES2020 para soporte de features modernas
- Strict mode habilitado
- Module bundler resolution para Next.js 14

---

## 📂 3. ESTRUCTURA DE DIRECTORIOS

```
OBSERVADOR4D/
│
├── 📁 app/                          # Next.js App Router
│   ├── 📁 api/                      # API Routes (Backend)
│   │   ├── 📁 auth/                 # NextAuth endpoints
│   │   ├── 📁 coherence/            # Métricas de coherencia
│   │   ├── 📁 daily-mapping/        # Mapeo diario
│   │   │   ├── entries/
│   │   │   ├── intentions/
│   │   │   ├── insights/
│   │   │   ├── patterns/
│   │   │   └── statistics/
│   │   ├── 📁 dashboard/            # APIs del dashboard
│   │   │   ├── context/             # ★ Contexto visual para IA
│   │   │   └── manifestations/
│   │   ├── 📁 decision-mode/        # ★ Modo Decisión CEO
│   │   ├── 📁 energy-flows/         # Flujos de energía
│   │   ├── 📁 gemini/               # ★ Integración Gemini AI
│   │   │   ├── analyze-coherence/   # Análisis de coherencia
│   │   │   └── chat/                # Chat con IA
│   │   ├── 📁 observador-macro/     # Chat Observador Macro
│   │   │   └── chat/
│   │   ├── 📁 projects/             # CRUD Proyectos
│   │   ├── 📁 relationships/        # CRUD Relaciones
│   │   ├── 📁 signup/               # Registro de usuarios
│   │   ├── 📁 synchronicities/      # Sincronicidades
│   │   ├── 📁 tablero-3d/           # ★ API datos 3D principal
│   │   ├── 📁 timeline/             # Timeline con memoria
│   │   │   └── snapshots/           # ★ Snapshots de nodos
│   │   └── 📁 user/
│   │       └── onboarding/          # Estado de onboarding
│   │
│   ├── 📁 auth/                     # Páginas de autenticación
│   │   ├── login/
│   │   └── signup/
│   │
│   ├── 📁 daily-mapping/            # Página de mapeo diario
│   ├── 📁 dashboard/                # ★ Dashboard principal
│   ├── 📁 tablero-3d/               # ★ Tablero 3D (Babylon.js)
│   ├── 📁 wolcoff/                  # ★ Vista Geometría Wolcoff
│   │
│   ├── layout.tsx                   # Layout raíz
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Estilos globales
│
├── 📁 components/                   # Componentes React
│   ├── 📁 auth/                     # Componentes de auth
│   ├── 📁 chat/                     # Chat Observador Macro
│   │   ├── chat-wrapper.tsx
│   │   └── observador-macro-chat.tsx # ★ Chat con visión
│   ├── 📁 daily-mapping/            # Componentes de mapeo
│   ├── 📁 dashboard/                # ★ Componentes del dashboard
│   │   ├── DecisionMode.tsx         # ★ Modal Modo Decisión
│   │   ├── NodeEvolution.tsx        # ★ Evolución de nodos
│   │   ├── dashboard-content.tsx    # ★ Contenido principal
│   │   ├── coherence-meters.tsx
│   │   ├── timeline-viewer.tsx
│   │   ├── projects-panel.tsx
│   │   ├── energy-flows.tsx
│   │   ├── relationships-map.tsx
│   │   ├── synchronicity-tracker.tsx
│   │   ├── ai-analysis.tsx
│   │   └── game-board.tsx
│   ├── 📁 gemini/                   # Componentes Gemini
│   ├── 📁 onboarding/               # ★ Wizard de onboarding
│   │   └── OnboardingWizard.tsx
│   ├── 📁 tablero3d/                # ★ COMPONENTES 3D (Babylon.js)
│   │   ├── Node3D.ts                # ★ Nodo 3D con Wolcoff
│   │   ├── Link3D.ts                # Enlaces entre nodos
│   │   ├── Grid3D.ts                # Rejilla del tablero
│   │   ├── Particles3D.ts           # Sistema de partículas
│   │   └── Scene3D.tsx              # ★ Escena principal
│   ├── 📁 ui/                       # Componentes UI (Radix)
│   │   └── [50+ componentes]
│   └── 📁 wolcoff/                  # ★ Visualización Wolcoff
│       └── WolcoffScene.tsx         # Escena Babylon.js Wolcoff
│
├── 📁 hooks/                        # Custom hooks
│
├── 📁 lib/                          # Utilidades y lógica
│   ├── auth.ts                      # Configuración NextAuth
│   ├── db.ts                        # Cliente Prisma
│   ├── nodeInterpreter.ts           # ★ Motor de Significado
│   ├── snapshotService.ts           # ★ Servicio de snapshots
│   ├── types.ts                     # Tipos TypeScript
│   └── utils.ts                     # Utilidades generales
│
├── 📁 prisma/                       # Base de datos
│   └── schema.prisma                # ★ Esquema completo
│
├── 📁 public/                       # Assets estáticos
│
├── 📁 scripts/                      # Scripts de utilidad
│
├── 📁 types/                        # Tipos TypeScript globales
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

**Leyenda:**
- ★ = Componente crítico/nuevo
- Los archivos marcados son los puntos de integración principales

---

## 🔌 4. CORAZÓN DE DATOS (APIs y Servicios)

### 4.1 API Principal del Tablero 3D

**Archivo:** `app/api/tablero-3d/route.ts`

Esta API es el **corazón del sistema de visualización**. Devuelve todos los nodos y enlaces para el tablero 3D.

```typescript
// Interfaces de datos
interface NodeData {
  id: string;
  x: number;      // Posición X en el plano
  y: number;      // Posición Y en el plano
  z: number;      // Altura (energía/progreso)
  size: number;   // Tamaño del nodo
  energy: number; // 0-1 nivel de energía
  label: string;  // Nombre visible
  color: string;  // Color hex
  type: 'self' | 'project' | 'relationship' | 'intention' | 'manifestation';
  metadata?: Record<string, any>;
}

interface LinkData {
  source: string;   // ID nodo origen
  target: string;   // ID nodo destino
  strength: number; // 0-1 fuerza de conexión
}

// Respuesta de la API
{
  success: true,
  nodes: NodeData[],      // Array de nodos
  links: LinkData[],      // Array de conexiones
  stats: {
    total: number,        // Total de nodos
    avgEnergy: number,    // Energía promedio (0-100)
    connections: number,  // Total de conexiones
    breakdown: {
      projects: number,
      relationships: number,
      intentions: number,
      manifestations: number
    },
    coherence: {
      overall: number,    // Coherencia global 0-100
      emotional: number,
      logical: number,
      energetic: number
    }
  }
}
```

### 4.2 API de Análisis con Gemini AI

**Archivo:** `app/api/gemini/analyze-coherence/route.ts`

```typescript
// POST /api/gemini/analyze-coherence
// Body: { text: string, context?: string }
// Response:
{
  coherence: number,     // 0-1 nivel de coherencia
  energy: number,        // 0-1 nivel de energía
  diagnosis: string,     // Diagnóstico corto
  recommendation: string,// Acción recomendada
  emotionalState?: string
}
```

### 4.3 API del Modo Decisión CEO

**Archivo:** `app/api/decision-mode/route.ts`

```typescript
// GET /api/decision-mode
// Response:
{
  healthScore: number,       // 0-100 salud del sistema
  topCritical: Array<{
    id: string,
    label: string,
    type: string,
    score: number,           // energía × conexiones
    energy: number,
    coherence: number,
    recommendation: string
  }>,
  bottleneck: {
    id: string,
    label: string,
    coherence: number,
    issue: string
  } | null,
  globalRecommendation: {
    action: 'Invertir' | 'Corregir' | 'Delegar' | 'Cerrar' | 'Mantener',
    target: string,
    reason: string
  }
}
```

### 4.4 API de Contexto Visual (Para IA con Visión)

**Archivo:** `app/api/dashboard/context/route.ts`

```typescript
// GET /api/dashboard/context
// Response (compacto, ~500 tokens):
{
  summary: {
    totalNodes: number,
    avgEnergy: number,
    avgCoherence: number,
    healthScore: number
  },
  projects: Array<{ name, status, energy, coherence }>,
  relationships: Array<{ name, quality, type }>,
  intentions: Array<{ title, streak, fulfillment }>,
  manifestations: Array<{ title, stage, status }>,
  alerts: Array<{ type, message, nodeId }>
}
```

### 4.5 Gestor de Estado Global

**Herramientas disponibles:**

| Librería | Uso Actual | Archivo |
|----------|------------|---------|
| **Zustand** | Estado del chat | `components/chat/` |
| **Jotai** | Estados atómicos | Disponible |
| **React Query** | Cache de APIs | En uso vía `useQuery` |
| **SWR** | Fetching con cache | Disponible |

**Patrón de fetching actual:**
```typescript
// La mayoría de componentes usan fetch directo con useEffect
useEffect(() => {
  fetch('/api/tablero-3d')
    .then(res => res.json())
    .then(data => setData(data));
}, []);
```

---

## 🎨 5. LA CARA (Interfaz Principal)

### 5.1 Layout Principal

**Archivo:** `app/layout.tsx`

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Providers>
            <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-purple-900/20">
              {children}
              <ChatWrapper /> {/* Chat flotante Observador Macro */}
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 5.2 Dashboard Principal

**Archivo:** `components/dashboard/dashboard-content.tsx`

Este es el **componente principal del dashboard**. Contiene:

1. **Onboarding Wizard** - Guía inicial de 5 pasos
2. **Modo Decisión Modal** - Vista ejecutiva
3. **Sidebar con navegación** - Menú lateral
4. **Header con usuario** - Barra superior
5. **Grid de componentes:**
   - GameBoard (tablero 2D)
   - CoherenceMeters (medidores)
   - TimelineViewer (línea de tiempo)
   - NodeEvolution (evolución de nodos)
   - ProjectsPanel (proyectos)
   - EnergyFlows (flujos de energía)
   - SynchronicityTracker (sincronicidades)
   - RelationshipsMap (mapa de relaciones)
   - AIAnalysis (análisis IA)

**Puntos de integración para nuevas visualizaciones:**

```tsx
// En dashboard-content.tsx, líneas ~316-446
<main className="p-4 lg:p-6 overflow-x-hidden">
  {/* AQUÍ SE PUEDEN INYECTAR NUEVAS VISUALIZACIONES */}
  
  {/* Tablero de Juego 4D */}
  <GameBoard recentData={gameBoardData} />
  
  {/* Métricas de Coherencia */}
  <CoherenceMeters />
  
  {/* Timeline */}
  <TimelineViewer />
  
  {/* Evolución de Nodos */}
  <NodeEvolution />
  
  {/* etc... */}
</main>
```

### 5.3 Tablero 3D (Visualización Principal)

**Página:** `app/tablero-3d/page.tsx`  
**Escena:** `components/tablero3d/Scene3D.tsx`

```tsx
// Scene3D.tsx - Escena Babylon.js
export default function Scene3D({ nodes, links, stats }: Scene3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const engine = new BABYLON.Engine(canvasRef.current, true);
    const scene = createScene(engine, canvasRef.current);
    
    // Crear nodos 3D
    nodes.forEach(nodeData => {
      Node3D.create(scene, nodeData, shadowGenerator);
    });
    
    // Crear links
    links.forEach(linkData => {
      Link3D.create(scene, linkData, nodes);
    });
    
    engine.runRenderLoop(() => scene.render());
    
    return () => engine.dispose();
  }, [nodes, links]);
  
  return <canvas ref={canvasRef} className="w-full h-full" />;
}
```

### 5.4 Nodo 3D con Geometría de Wolcoff

**Archivo:** `components/tablero3d/Node3D.ts`

```typescript
import * as BABYLON from '@babylonjs/core';
import { getWolcoffDistortion, getWolcoffColor } from '@/lib/nodeInterpreter';

export interface NodeData {
  id: string;
  x: number;
  y: number;
  z: number;
  size: number;
  energy: number;
  label: string;
  color: string;
  type: string;
  coherence?: number;  // 0-1 coherencia
}

export class Node3D {
  static create(
    scene: BABYLON.Scene,
    nodeData: NodeData,
    shadowGenerator: BABYLON.ShadowGenerator
  ): BABYLON.Mesh {
    const coherence = nodeData.coherence ?? nodeData.energy;
    const wolcoff = getWolcoffDistortion(coherence);
    
    // Crear esfera con materiales
    const sphere = BABYLON.MeshBuilder.CreateSphere(...);
    
    // Animación Wolcoff basada en coherencia
    scene.registerBeforeRender(() => {
      if (coherence > 0.8) {
        // FLUJO: Esfera perfecta, rotación suave
      } else if (coherence > 0.5) {
        // CONSTRUCCIÓN: Ondulación leve
      } else if (coherence > 0.3) {
        // FRICCIÓN: Distorsión visible + vibración
      } else {
        // COLAPSO: Caos total, temblor constante
      }
    });
    
    return sphere;
  }
}
```

---

## 🗄️ 6. ESQUEMA DE BASE DE DATOS (Prisma)

**Archivo:** `prisma/schema.prisma`

### Modelos Principales

```prisma
// Usuario
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?
  onboardingCompleted Boolean @default(false)
  onboardingStep      Int     @default(0)
  
  // Relaciones
  dailyEntries    DailyEntry[]
  intentions      Intention[]
  patterns        Pattern[]
  projects        Project[]
  relationships   Relationship[]
  manifestations  Manifestation[]
  metrics         UserMetrics[]
  nodeSnapshots   NodeSnapshot[]
}

// Proyecto (nodo tipo "project")
model Project {
  id            String   @id @default(cuid())
  userId        String
  name          String
  description   String?
  category      String?
  status        String   @default("active")
  progress      Float    @default(0.0)        // 0-100
  energyInvested Float   @default(0.0)        // 1-10
  startDate     DateTime @default(now())
  targetDate    DateTime?
  impactLevel   Float?
  satisfactionLevel Float?
  relatedPeople String[]
}

// Relación (nodo tipo "relationship")
model Relationship {
  id               String   @id @default(cuid())
  userId           String
  name             String
  description      String?
  relationshipType String
  connectionQuality Float @default(5.0)       // 1-10
  energyExchange    String @default("balanced")
  importance       Float?                     // 1-10
}

// Intención (nodo tipo "intention")
model Intention {
  id            String   @id @default(cuid())
  userId        String
  title         String
  description   String?
  category      String
  frequency     String   @default("daily")
  status        String   @default("active")
  currentStreak Int      @default(0)
  longestStreak Int      @default(0)
}

// Manifestación (nodo tipo "manifestation")
model Manifestation {
  id               String  @id @default(cuid())
  userId           String
  title            String
  description      String?
  category         String?
  timeframe        String
  energyRequired   Float
  impactLevel      Float
  status           String  @default("intention")
  manifestationStage Float @default(0.0)      // 0-100
}

// Métricas de usuario (coherencia global)
model UserMetrics {
  id                  String   @id @default(cuid())
  userId              String
  date                DateTime @default(now())
  overallCoherence    Float    // 0-100
  emotionalCoherence  Float
  logicalCoherence    Float
  energeticCoherence  Float
  synchronicityCount  Int      @default(0)
}

// Snapshots para Timeline con Memoria
model NodeSnapshot {
  id            String   @id @default(cuid())
  userId        String
  nodeId        String    // project_xxx, relationship_xxx, etc.
  nodeType      String    // project, relationship, intention, manifestation
  nodeLabel     String
  energy        Float     // 0-1
  coherence     Float     // 0-1
  connections   Int
  triggerType   String    // auto, manual, threshold
  triggerReason String?
  statusLabel   String?   // Flujo, Fricción, etc.
  recommendation String?
  metadata      Json?
  createdAt     DateTime  @default(now())
}
```

---

## 🔄 7. FLUJO DE DATOS

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │ Dashboard   │    │ Tablero 3D  │    │ Wolcoff View        │  │
│  │ Content     │    │ (Babylon.js)│    │ (Babylon.js)        │  │
│  └──────┬──────┘    └──────┬──────┘    └──────────┬──────────┘  │
│         │                  │                       │             │
│         ▼                  ▼                       ▼             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    fetch() / SWR / React Query               │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Next.js API Routes)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │/api/tablero-3d│  │/api/decision │  │/api/gemini/analyze   │   │
│  │              │  │    -mode     │  │    -coherence        │   │
│  └───────┬──────┘  └───────┬──────┘  └───────────┬──────────┘   │
│          │                 │                      │              │
│          ▼                 ▼                      ▼              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      lib/nodeInterpreter.ts                  │ │
│  │                   (Motor de Significado)                     │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATOS                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐           ┌──────────────────────────┐    │
│  │   PostgreSQL     │           │    Google Gemini AI      │    │
│  │   (Neon.tech)    │           │    (2.0 Flash)           │    │
│  │   via Prisma     │           │                          │    │
│  └──────────────────┘           └──────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 8. PUNTOS DE INTEGRACIÓN PARA NUEVAS VISUALIZACIONES

### Opción A: Reemplazar/Extender Babylon.js existente

**Archivos a modificar:**
```
components/tablero3d/
├── Node3D.ts      ← Modificar apariencia de nodos
├── Link3D.ts      ← Modificar apariencia de enlaces
├── Grid3D.ts      ← Modificar rejilla/fondo
├── Particles3D.ts ← Modificar partículas
└── Scene3D.tsx    ← Modificar escena completa
```

### Opción B: Agregar nueva visualización Three.js/D3

**Crear nuevos componentes:**
```
components/
├── visualization-three/
│   └── ThreeScene.tsx    ← Nueva escena Three.js
├── visualization-d3/
│   └── D3Graph.tsx       ← Nueva visualización D3
└── dashboard/
    └── dashboard-content.tsx  ← Integrar aquí
```

### Opción C: Sistema Solar de Proyectos (Ejemplo)

**Estructura sugerida:**
```
components/solar-system/
├── SolarSystemScene.tsx    ← Escena principal
├── Planet.tsx              ← Planeta (proyecto)
├── Orbit.tsx               ← Órbita visual
├── Sun.tsx                 ← Sol central (usuario)
└── AsteroidBelt.tsx        ← Intenciones/manifestaciones
```

**Integración en dashboard:**
```tsx
// En dashboard-content.tsx
import { SolarSystem } from '@/components/solar-system/SolarSystemScene';

// Dentro del grid:
<SolarSystem 
  projects={gameBoardData.projects}
  relationships={gameBoardData.relationships}
  centralNode={observerNode}
/>
```

---

## 📋 9. RESUMEN DE APIs DISPONIBLES

| Endpoint | Método | Descripción | Response Principal |
|----------|--------|-------------|-------------------|
| `/api/tablero-3d` | GET | Nodos y links para 3D | `{ nodes, links, stats }` |
| `/api/decision-mode` | GET | Datos para CEO view | `{ healthScore, topCritical, bottleneck }` |
| `/api/gemini/analyze-coherence` | POST | Análisis IA de texto | `{ coherence, energy, diagnosis }` |
| `/api/dashboard/context` | GET | Contexto compacto | `{ summary, projects, alerts }` |
| `/api/timeline/snapshots` | GET/POST | Historial de nodos | `{ snapshots[], trends }` |
| `/api/projects` | GET/POST/PUT | CRUD proyectos | `Project[]` |
| `/api/relationships` | GET/POST/PUT | CRUD relaciones | `Relationship[]` |
| `/api/dashboard/manifestations` | GET | Manifestaciones | `Manifestation[]` |
| `/api/daily-mapping/entries` | GET/POST | Entradas diarias | `DailyEntry[]` |

---

## 🚀 10. DEPLOYMENT

| Servicio | Uso |
|----------|-----|
| **Vercel** | Hosting (Next.js) |
| **Neon.tech** | PostgreSQL |
| **Google Cloud** | Gemini AI API |

**URL de producción:** `https://4d-observador-macro.vercel.app/`

---

## 📝 11. NOTAS PARA EL EQUIPO DE VISUALIZACIÓN

### Lo que YA está hecho con Babylon.js:
- ✅ Tablero 3D completo con nodos, enlaces, partículas
- ✅ Geometría de Wolcoff (distorsión por coherencia)
- ✅ Sombras, glow, animaciones
- ✅ Interacción (click, hover, tooltips)
- ✅ Panel lateral con interpretación de nodos
- ✅ Vista Wolcoff separada

### Lo que se podría agregar con Three.js/D3:
- 🎨 Sistema Solar de Proyectos
- 🎨 Grafos de red interactivos (D3 force)
- 🎨 Visualizaciones de flujo de energía
- 🎨 Mapas de calor de coherencia
- 🎨 Líneas de tiempo 3D interactivas

### Recomendación:
**No duplicar el motor 3D principal** (Babylon.js). Mejor:
1. Extender las visualizaciones existentes
2. Agregar vistas complementarias con Three.js/D3
3. Usar el mismo flujo de datos (`/api/tablero-3d`)

---

*Documento generado el 12 de Enero, 2026*  
*OBSERVADOR4D - Plataforma de Expansión de Conciencia*
