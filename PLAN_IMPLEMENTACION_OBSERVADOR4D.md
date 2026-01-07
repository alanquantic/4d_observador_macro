# 🚀 PLAN MAESTRO DE IMPLEMENTACIÓN - OBSERVADOR4D

**Versión:** 2.0  
**Fecha:** 7 de Enero, 2026  
**Estado:** Aprobado para Implementación  
**Motor 3D:** Babylon.js (existente, NO instalar Three.js)

---

## 📋 RESUMEN DE DECISIONES TÉCNICAS

| Decisión | Resolución |
|----------|------------|
| Motor 3D | ✅ Babylon.js (existente) - NO Three.js |
| API Gemini | ✅ Implementar para análisis de coherencia |
| Cálculo de coherencia | ✅ Ambas: IA (Gemini) + Sistema (métricas) |
| Esfera Wolcoff | ✅ Vista SEPARADA (nueva página) |
| Distorsión geométrica | ✅ Scaling no uniforme + vibración en Babylon.js |

---

## 🎯 BACKLOG INTEGRADO POR PRIORIDAD

### 🔴 PRIORIDAD 0 - CRÍTICO (Semanas 1-2)

---

#### TICKET 1: Motor de Significado por Nodo
**Tiempo estimado:** 4-5 días

##### Objetivo
Convertir cada nodo 3D en una unidad de lectura accionable.

##### Archivos a modificar
```
├── lib/nodeInterpreter.ts        → CREAR (lógica de interpretación)
├── components/tablero3d/Scene3D.tsx → Integrar interpretación en panel
└── app/api/tablero-3d/route.ts   → Agregar datos de interpretación
```

##### Implementación

**1. Crear `lib/nodeInterpreter.ts`**
```typescript
interface NodeInterpretation {
  statusLabel: 'Flujo' | 'Expansión' | 'Fricción' | 'Saturación' | 'Colapso';
  statusColor: string;
  recommendation: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export function interpretNode(
  node: NodeData,
  links: LinkData[],
  coherence: number
): NodeInterpretation {
  const connections = links.filter(l => l.source === node.id || l.target === node.id);
  const avgStrength = connections.reduce((a, l) => a + l.strength, 0) / (connections.length || 1);
  
  // Matriz de decisión
  if (node.energy > 0.8 && coherence > 0.7) {
    return {
      statusLabel: 'Flujo',
      statusColor: '#FFD700',
      recommendation: 'Mantener ritmo actual. Considerar expandir.',
      urgency: 'low'
    };
  }
  
  if (node.energy > 0.6 && coherence > 0.5) {
    return {
      statusLabel: 'Expansión',
      statusColor: '#00FF88',
      recommendation: 'Buen momento para invertir más recursos.',
      urgency: 'low'
    };
  }
  
  if (node.energy < 0.4 && connections.length > 3) {
    return {
      statusLabel: 'Saturación',
      statusColor: '#FF4500',
      recommendation: 'Demasiadas conexiones para poca energía. Delegar o cerrar.',
      urgency: 'high'
    };
  }
  
  if (coherence < 0.4) {
    return {
      statusLabel: 'Fricción',
      statusColor: '#FF0000',
      recommendation: 'Alta resistencia detectada. Revisar alineación.',
      urgency: 'critical'
    };
  }
  
  if (node.energy < 0.3 && coherence < 0.3) {
    return {
      statusLabel: 'Colapso',
      statusColor: '#808080',
      recommendation: 'Evaluar cierre o reformulación completa.',
      urgency: 'critical'
    };
  }
  
  return {
    statusLabel: 'Expansión',
    statusColor: '#00BFFF',
    recommendation: 'Estado estable. Monitorear.',
    urgency: 'medium'
  };
}
```

**2. Modificar panel lateral en `Scene3D.tsx`**
- Agregar sección de interpretación
- Mostrar `statusLabel` con color
- Mostrar `recommendation`
- Indicador visual de urgencia

##### Criterio de éxito
Usuario hace click en nodo → Ve estado + recomendación → Sabe qué hacer

---

#### TICKET 2: Geometría de Wolcoff (Distorsión por Coherencia)
**Tiempo estimado:** 4-5 días

##### Objetivo
Visualizar coherencia vs fricción usando geometría en Babylon.js.

##### Archivos a modificar
```
├── components/tablero3d/Node3D.ts → Extender con lógica Wolcoff
├── lib/types.ts                   → Agregar coherence a NodeData
└── app/api/tablero-3d/route.ts    → Calcular coherencia por nodo
```

##### Implementación

**1. Extender `NodeData` en `lib/types.ts`**
```typescript
interface NodeData {
  id: string;
  x: number;
  y: number;
  z: number;
  size: number;
  energy: number;
  label: string;
  color: string;
  type: string;
  coherence?: number;  // NUEVO: 0-1
  metadata?: Record<string, any>;
}
```

**2. Modificar `Node3D.ts` - Agregar lógica Wolcoff**
```typescript
static create(
  scene: BABYLON.Scene,
  nodeData: NodeData,
  shadowGenerator: BABYLON.ShadowGenerator
): BABYLON.Mesh {
  // ... código existente de creación de esfera ...
  
  const coherence = nodeData.coherence ?? 1;
  const distortion = 1 - coherence;
  
  // Fase aleatoria para que cada nodo sea único
  let phase = Math.random() * Math.PI * 2;
  
  scene.registerBeforeRender(() => {
    time += 0.01;
    
    // === LÓGICA WOLCOFF ===
    
    if (coherence > 0.8) {
      // FLUJO DIVINO: Esfera perfecta, rotación suave
      sphere.scaling.setAll(1);
      // Vibración mínima y armónica
      const gentleVibration = Math.sin(time) * 0.02 * nodeData.energy;
      sphere.position.y = nodeData.z + gentleVibration;
      
    } else if (coherence > 0.5) {
      // CONSTRUCCIÓN: Leve ondulación
      sphere.scaling.x = 1 + Math.sin(time * 1.5 + phase) * 0.05 * distortion;
      sphere.scaling.y = 1 + Math.cos(time * 1.2 + phase) * 0.04 * distortion;
      sphere.scaling.z = 1 + Math.sin(time * 1.8 + phase) * 0.03 * distortion;
      
    } else if (coherence > 0.3) {
      // EGO/ESFUERZO: Distorsión visible
      sphere.scaling.x = 1 + Math.sin(time * 3 + phase) * 0.15 * distortion;
      sphere.scaling.y = 1 + Math.cos(time * 2.5 + phase) * 0.12 * distortion;
      sphere.scaling.z = 1 + Math.sin(time * 4 + phase) * 0.18 * distortion;
      
      // Vibración errática
      sphere.position.x = nodeData.x + (Math.random() - 0.5) * 0.05 * distortion;
      sphere.position.z = nodeData.y + (Math.random() - 0.5) * 0.05 * distortion;
      
    } else {
      // COLAPSO: Forma muy errática, casi estática
      sphere.scaling.x = 1 + Math.sin(time * 5) * 0.25 * distortion;
      sphere.scaling.y = 1 + Math.cos(time * 4) * 0.2 * distortion;
      sphere.scaling.z = 1 + Math.sin(time * 6) * 0.3 * distortion;
      
      // Temblor constante
      sphere.position.x = nodeData.x + (Math.random() - 0.5) * 0.1;
      sphere.position.z = nodeData.y + (Math.random() - 0.5) * 0.1;
    }
    
    // Glow inestable proporcional a distorsión
    const glowInstability = distortion * 0.1;
    glowMat.alpha = 0.15 + Math.sin(time * (2 + distortion * 4)) * glowInstability;
    
    // Core parpadea más en baja coherencia
    const coreFlicker = coherence > 0.5 ? 0.3 : 0.5;
    coreMat.emissiveColor = new BABYLON.Color3(
      0.7 + Math.sin(time * 3) * coreFlicker,
      0.7 + Math.sin(time * 3) * coreFlicker,
      0.7 + Math.sin(time * 3) * coreFlicker
    );
  });
  
  return sphere;
}
```

**3. Actualizar colores según coherencia**
```typescript
// En la API o en Scene3D, ajustar color según coherencia
function getWolcoffColor(coherence: number): string {
  if (coherence > 0.8) return '#FFD700'; // Oro - Flujo
  if (coherence > 0.5) return '#00BFFF'; // Azul - Orden
  if (coherence > 0.3) return '#FF4500'; // Rojo - Ego
  return '#808080'; // Gris - Colapso
}
```

##### Criterio de éxito
Estado emocional/estratégico se percibe visualmente sin leer texto.

---

#### TICKET 3: API de Análisis con Gemini
**Tiempo estimado:** 3-4 días

##### Objetivo
Implementar análisis de coherencia vía IA para textos del usuario.

##### Archivos a crear
```
└── app/api/gemini/analyze-coherence/route.ts → CREAR
```

##### Implementación

```typescript
// app/api/gemini/analyze-coherence/route.ts
import { GoogleGenerativeAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { text, context } = await request.json();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Analiza este texto en el contexto de gestión de proyectos y bienestar personal.
      Contexto: ${context || 'General'}
      Texto: "${text}"

      Evalúa basándote en:
      1. COHERENCE (0.0 a 1.0): Nivel de alineación y flujo vs resistencia y esfuerzo forzado.
         - 1.0 = Flujo total, sin fricción, claridad
         - 0.5 = Esfuerzo balanceado, algo de resistencia
         - 0.0 = Puro ego, miedo, bloqueo total

      2. ENERGY (0.0 a 1.0): Nivel de vitalidad y recursos disponibles.

      3. DIAGNOSIS: Frase corta (máx 15 palabras) describiendo el estado.

      4. RECOMMENDATION: Acción concreta a tomar (máx 20 palabras).

      Responde SOLO este JSON (sin markdown):
      {
        "coherence": number,
        "energy": number,
        "diagnosis": "string",
        "recommendation": "string"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, '').trim();
    
    return NextResponse.json(JSON.parse(responseText));

  } catch (error: any) {
    console.error("Error en análisis de coherencia:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

##### Uso desde el frontend
```typescript
const analyzeWithAI = async (text: string) => {
  const response = await fetch('/api/gemini/analyze-coherence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, context: 'proyecto' })
  });
  return response.json();
};
```

##### Criterio de éxito
Usuario escribe texto → IA devuelve coherencia → Geometría se actualiza

---

#### TICKET 4: Modo Decisión CEO
**Tiempo estimado:** 4-5 días

##### Objetivo
Permitir a un CEO tomar una decisión clara en menos de 5 minutos.

##### Archivos a crear/modificar
```
├── components/dashboard/DecisionMode.tsx    → CREAR
├── app/api/decision-mode/route.ts           → CREAR
└── app/dashboard/page.tsx                   → Integrar botón
```

##### Implementación

**1. Crear `components/dashboard/DecisionMode.tsx`**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, TrendingDown, Zap, X } from 'lucide-react';

interface DecisionData {
  topCritical: Array<{
    id: string;
    label: string;
    score: number; // energy × connections
    recommendation: string;
  }>;
  bottleneck: {
    id: string;
    label: string;
    coherence: number;
    issue: string;
  } | null;
  globalRecommendation: {
    action: 'Invertir' | 'Corregir' | 'Delegar' | 'Cerrar' | 'Mantener';
    target: string;
    reason: string;
  };
  healthScore: number; // 0-100
}

export function DecisionMode({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<DecisionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/decision-mode')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="text-cyan-400 text-xl animate-pulse">
          Analizando tu sistema...
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Modo Decisión</h1>
            <p className="text-slate-400">Resumen ejecutivo en 5 minutos</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Health Score */}
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-cyan-500/30 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Salud del Sistema</p>
              <p className="text-5xl font-bold text-white">{data.healthScore}%</p>
            </div>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              data.healthScore > 70 ? 'bg-green-500/20 text-green-400' :
              data.healthScore > 40 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {data.healthScore > 70 ? <TrendingUp className="w-10 h-10" /> :
               data.healthScore > 40 ? <Zap className="w-10 h-10" /> :
               <TrendingDown className="w-10 h-10" />}
            </div>
          </div>
        </Card>

        {/* Top 3 Críticos */}
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          Top 3 Nodos Críticos
        </h2>
        <div className="grid gap-4 mb-6">
          {data.topCritical.map((node, i) => (
            <Card key={node.id} className="bg-slate-900/50 border-slate-700 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-medium">{i + 1}. {node.label}</p>
                  <p className="text-slate-400 text-sm mt-1">{node.recommendation}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-cyan-400">{node.score.toFixed(0)}</p>
                  <p className="text-xs text-slate-500">Score</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Cuello de Botella */}
        {data.bottleneck && (
          <>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Cuello de Botella
            </h2>
            <Card className="bg-red-950/30 border-red-500/50 p-4 mb-6">
              <p className="text-white font-medium">{data.bottleneck.label}</p>
              <p className="text-red-300 text-sm mt-1">{data.bottleneck.issue}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-slate-400">Coherencia:</span>
                <span className="text-red-400 font-mono">{(data.bottleneck.coherence * 100).toFixed(0)}%</span>
              </div>
            </Card>
          </>
        )}

        {/* Recomendación Global */}
        <Card className="bg-gradient-to-r from-purple-950/50 to-cyan-950/50 border-purple-500/30 p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Recomendación Principal</h2>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
              data.globalRecommendation.action === 'Invertir' ? 'bg-green-500/20 text-green-400' :
              data.globalRecommendation.action === 'Corregir' ? 'bg-yellow-500/20 text-yellow-400' :
              data.globalRecommendation.action === 'Delegar' ? 'bg-blue-500/20 text-blue-400' :
              data.globalRecommendation.action === 'Cerrar' ? 'bg-red-500/20 text-red-400' :
              'bg-slate-500/20 text-slate-400'
            }`}>
              {data.globalRecommendation.action}
            </div>
            <div>
              <p className="text-white">{data.globalRecommendation.target}</p>
              <p className="text-slate-400 text-sm">{data.globalRecommendation.reason}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
```

**2. Crear `app/api/decision-mode/route.ts`**
```typescript
// Lógica de cálculo de métricas de decisión
// - Top 3: ordenar por (energy × connections.length)
// - Bottleneck: nodo con menor coherencia + más conexiones
// - Global: reglas de negocio basadas en promedios
```

##### Criterio de éxito
CEO entra → 5 minutos → Sale con acción concreta

---

### 🔴 PRIORIDAD 0 - CRÍTICO (Semana 2-3)

---

#### TICKET 5: Vista Esfera Wolcoff (Separada)
**Tiempo estimado:** 5-6 días

##### Objetivo
Crear una vista dedicada para visualización ontológica individual de proyectos/nodos.

##### Archivos a crear
```
├── app/wolcoff/page.tsx                      → Página principal
├── app/wolcoff/[nodeId]/page.tsx             → Vista de nodo específico
├── components/wolcoff/WolcoffScene.tsx       → Escena Babylon.js dedicada
├── components/wolcoff/WolcoffControls.tsx    → Panel de control
└── components/wolcoff/CoherenceInput.tsx     → Input para análisis IA
```

##### Implementación

**1. Crear página `app/wolcoff/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import WolcoffScene from '@/components/wolcoff/WolcoffScene';
import WolcoffControls from '@/components/wolcoff/WolcoffControls';
import CoherenceInput from '@/components/wolcoff/CoherenceInput';

export default function WolcoffPage() {
  const [coherence, setCoherence] = useState(0.7);
  const [energy, setEnergy] = useState(0.8);
  const [diagnosis, setDiagnosis] = useState('');
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');

  const handleAIAnalysis = async (text: string) => {
    const res = await fetch('/api/gemini/analyze-coherence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    setCoherence(data.coherence);
    setEnergy(data.energy);
    setDiagnosis(data.diagnosis);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="grid grid-cols-1 lg:grid-cols-3 h-screen">
        {/* Visualizador 3D - 2/3 de pantalla */}
        <div className="lg:col-span-2 relative">
          <WolcoffScene coherence={coherence} energy={energy} />
          
          {/* Overlay de métricas */}
          <div className="absolute top-4 left-4 bg-black/70 p-4 rounded-lg">
            <p className="text-cyan-400 font-mono text-sm">WOLCOFF ENGINE v1.0</p>
            <p className="text-white">Coherencia: {(coherence * 100).toFixed(0)}%</p>
            <p className="text-white">Energía: {(energy * 100).toFixed(0)}%</p>
            {diagnosis && (
              <p className="text-yellow-400 text-sm mt-2">{diagnosis}</p>
            )}
          </div>
        </div>

        {/* Panel de Control - 1/3 de pantalla */}
        <div className="bg-slate-950 p-6 overflow-auto border-l border-slate-800">
          <h1 className="text-2xl font-bold text-white mb-6">
            Geometría Ontológica
          </h1>

          {/* Tabs: Manual / IA */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('manual')}
              className={`px-4 py-2 rounded-lg ${
                mode === 'manual' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Manual
            </button>
            <button
              onClick={() => setMode('ai')}
              className={`px-4 py-2 rounded-lg ${
                mode === 'ai' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Análisis IA
            </button>
          </div>

          {mode === 'manual' ? (
            <WolcoffControls
              coherence={coherence}
              energy={energy}
              onCoherenceChange={setCoherence}
              onEnergyChange={setEnergy}
            />
          ) : (
            <CoherenceInput onAnalyze={handleAIAnalysis} />
          )}
        </div>
      </div>
    </div>
  );
}
```

**2. Crear `components/wolcoff/WolcoffScene.tsx`**
Escena Babylon.js dedicada con una sola esfera grande central que muestra la geometría de Wolcoff con máximo detalle visual.

##### Criterio de éxito
Usuario puede ver su estado geométrico individual y corregirlo en tiempo real.

---

### 🟠 PRIORIDAD 1 (Semana 3-4)

---

#### TICKET 6: Timeline con Memoria de Estado
**Tiempo estimado:** 5-6 días

##### Objetivo
El sistema recuerda cambios importantes para mostrar evolución.

##### Archivos a crear/modificar
```
├── prisma/schema.prisma           → Agregar modelo NodeSnapshot
├── app/api/timeline/route.ts      → Endpoints de snapshots
└── components/dashboard/TimelineViewer.tsx → Modificar vista
```

##### Modelo de datos (Prisma)
```prisma
model NodeSnapshot {
  id          String   @id @default(cuid())
  nodeId      String
  nodeLabel   String
  nodeType    String
  energy      Float
  coherence   Float
  connections Int
  createdAt   DateTime @default(now())
  userId      String
  
  user        User     @relation(fields: [userId], references: [id])
  
  @@index([userId, createdAt])
  @@index([nodeId])
}
```

##### Lógica de guardado
- Guardar snapshot cuando energía cambia >15%
- Guardar snapshot cuando coherencia cambia >20%
- Guardar snapshot semanal automático

##### Criterio de éxito
Usuario puede ver "antes vs después" de cualquier nodo.

---

#### TICKET 7: Onboarding Wizard
**Tiempo estimado:** 4-5 días

##### Objetivo
Reducir fricción inicial para nuevos usuarios.

##### Archivos a crear
```
├── components/onboarding/OnboardingWizard.tsx
├── components/onboarding/steps/*.tsx
└── app/api/user/onboarding/route.ts
```

##### Flujo de 5 pasos
1. **Bienvenida** - Explicación del sistema
2. **Crear Nodo Self** - "Tú eres el centro"
3. **Crear Proyecto** - Primer proyecto activo
4. **Crear Relación** - Conexión importante
5. **Ver Geometría** - Mostrar impacto visual + recomendación

##### Criterio de éxito
Usuario nuevo entiende el sistema sin ayuda externa.

---

### 🟡 PRIORIDAD 2 (Futuro)

---

#### TICKET 8: API de Interpretación Avanzada (IA)
**Tiempo estimado:** Por definir

##### Objetivo
Preparar para interpretación completa del sistema vía Gemini.

##### Funcionalidades futuras
- Resumen ejecutivo automático
- Alertas predictivas
- Sugerencias basadas en patrones históricos

---

## 📅 CRONOGRAMA ESTIMADO

```
SEMANA 1:
├── Día 1-2: Ticket 1 (Motor de Significado)
├── Día 3-4: Ticket 2 (Geometría Wolcoff en Node3D)
└── Día 5: Ticket 3 (API Gemini)

SEMANA 2:
├── Día 1-2: Ticket 3 (finalizar API Gemini)
├── Día 3-4: Ticket 4 (Modo Decisión)
└── Día 5: Integración y pruebas

SEMANA 3:
├── Día 1-3: Ticket 5 (Vista Wolcoff separada)
├── Día 4-5: Ticket 6 (Timeline con memoria)

SEMANA 4:
├── Día 1-2: Ticket 6 (finalizar Timeline)
├── Día 3-4: Ticket 7 (Onboarding)
└── Día 5: Testing final y deploy
```

---

## 🚫 RESTRICCIONES (NO HACER)

- ❌ **NO instalar Three.js / React Three Fiber**
- ❌ **NO agregar features visuales sin impacto en decisión**
- ❌ **NO usar lenguaje esotérico en UI** (nada de "Kavaná", "Lehashpía" visible)
- ❌ **NO métricas sin recomendación asociada**
- ❌ **NO duplicar motores 3D**

---

## ✅ DEFINICIÓN DE ÉXITO

> **OBSERVADOR4D estará listo cuando un CEO pueda:**
> 1. Entrar en 5 minutos
> 2. Entender dónde está perdiendo energía
> 3. Ver la distorsión geométrica de sus proyectos
> 4. Salir con una decisión clara

---

## 📝 NOTAS TÉCNICAS

### Cálculo de Coherencia (Sistema)
```typescript
function calculateSystemCoherence(node: NodeData, links: LinkData[]): number {
  const nodeLinks = links.filter(l => l.source === node.id || l.target === node.id);
  const avgStrength = nodeLinks.reduce((a, l) => a + l.strength, 0) / (nodeLinks.length || 1);
  
  // Fórmula: Coherencia = (Energía + Fuerza promedio de conexiones) / 2
  return (node.energy + avgStrength) / 2;
}
```

### Cálculo de Coherencia (IA)
```typescript
// Usar endpoint /api/gemini/analyze-coherence
// Input: texto del usuario sobre el proyecto
// Output: { coherence: number, energy: number, diagnosis: string }
```

### Fórmula Wolcoff (Distorsión)
```
Distorsión = 1 - Coherencia
- Coherencia 1.0 → Distorsión 0.0 → Esfera perfecta
- Coherencia 0.5 → Distorsión 0.5 → Ondulación media
- Coherencia 0.0 → Distorsión 1.0 → Caos total
```

---

*Documento de implementación para OBSERVADOR4D*
*Versión 2.0 - Aprobado para desarrollo*

