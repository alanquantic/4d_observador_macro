# 🎯 Herramientas Geométricas - OBSERVADOR4D

Este documento explica las herramientas geométricas 3D del proyecto y las decisiones técnicas detrás de su implementación.

---

## 📦 Motor 3D: Babylon.js

### ¿Por qué Babylon.js?

El proyecto utiliza **Babylon.js** como motor 3D principal por las siguientes razones:

```json
"@babylonjs/core": "7.35.0",
"@babylonjs/loaders": "7.35.0"
```

### ✅ Ventajas para OBSERVADOR4D

| Característica | Beneficio para el Proyecto |
|----------------|---------------------------|
| **Sombras integradas** | Los nodos proyectan sombras realistas sobre el grid sin configuración adicional |
| **Sistema de partículas nativo** | 2500 partículas ambientales funcionando con alto rendimiento |
| **Materiales emisivos** | Efectos de glow y brillo holográfico nativos |
| **ShadowGenerator built-in** | Sombras suaves con blur exponencial en una sola línea |
| **TypeScript nativo** | Tipado completo sin paquetes adicionales |
| **WebGPU ready** | Preparado para la próxima generación de gráficos web |

### 🆚 Comparación con Alternativas

| Aspecto | Babylon.js ✅ | Three.js |
|---------|--------------|----------|
| **Sombras** | `ShadowGenerator` integrado | Requiere setup manual extenso |
| **Partículas** | `ParticleSystem` nativo robusto | Necesita librerías adicionales |
| **Glow/Emisivos** | `emissiveColor` + `alphaMode` | Requiere post-processing |
| **Física** | Motor integrado (Havok/Cannon) | Importar separadamente |
| **Inspector/Debug** | Herramienta visual incluida | Extensiones de terceros |
| **Documentación** | Playground interactivo oficial | Dispersa en ejemplos |

### 🎯 Decisión Técnica

Para el **Tablero 3D de OBSERVADOR4D** necesitábamos:

1. ✅ **Sombras realistas** → Los nodos deben proyectar sombras sobre el grid holográfico
2. ✅ **Partículas ambientales** → Ambiente inmersivo con 2500 partículas flotantes
3. ✅ **Materiales emisivos** → Efecto glow en nodos y conexiones
4. ✅ **Animaciones fluidas** → Vibración 4D y pulsación de energía
5. ✅ **Alto rendimiento** → 12+ nodos + 15+ conexiones + 2500 partículas

**Babylon.js ofrece todo esto "out of the box"**, mientras que Three.js requeriría:
- Configurar `PCFSoftShadowMap` manualmente
- Instalar `three-particle-system` o similar
- Configurar `EffectComposer` para bloom/glow
- Más código boilerplate

---

## 🏗️ Arquitectura de Componentes 3D

Todos los componentes geométricos se encuentran en:
```
components/tablero3d/
├── Grid3D.ts       → Plano base y grid holográfico
├── Node3D.ts       → Nodos esféricos 3D con glow
├── Link3D.ts       → Conexiones energéticas entre nodos
├── Particles3D.ts  → Sistema de partículas ambientales
└── Scene3D.tsx     → Orquestador principal de la escena
```

---

## 📐 Grid3D - Plano Base Holográfico

### Descripción
Crea el plano base del tablero con efecto holográfico y animación de ondulación sinusoidal.

### Método Principal
```typescript
Grid3D.create(scene: BABYLON.Scene): void
```

### Datos de Entrada
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `scene` | `BABYLON.Scene` | Escena de Babylon.js donde se creará el grid |

### Elementos Generados

#### 1. Plano Base (Ground)
```typescript
{
  width: 200,          // Ancho del plano
  height: 200,         // Alto del plano
  subdivisions: 80,    // Subdivisiones para animación de vértices
  position.y: -5,      // Posición vertical (debajo de nodos)
  receiveShadows: true // ⭐ Recibe sombras de los nodos (feature de Babylon.js)
}
```

#### 2. Líneas de Grid
```typescript
{
  gridSize: 100,       // Tamaño total del grid
  divisions: 20,       // Número de divisiones
  step: 5,             // Espaciado entre líneas (100/20)
  color: RGB(0.1, 0.4, 0.6),  // Color cyan suave
  alpha: 0.4           // Transparencia
}
```

#### 3. Anillos Territoriales Concéntricos
```typescript
// 4 anillos con radios: 10, 20, 30, 40
{
  diameter: r * 2,     // Diámetro = radio × 2
  thickness: 0.08,     // Grosor del torus
  tessellation: 64,    // Suavidad del anillo
  color: RGB(0, 0.8, 1), // Cyan brillante
  alpha: 0.2 - (r/40)*0.15, // Más transparente mientras más grande
  alphaMode: ALPHA_ADD // ⭐ Modo aditivo para efecto glow
}
```

#### 4. Animación de Ondulación
```typescript
// Deformación sinusoidal del plano (actualización de vértices en tiempo real)
scene.registerBeforeRender(() => {
  positions[y] = sin(distance * 0.1 - time) * 0.3
  ground.updateVerticesData(PositionKind, positions) // ⭐ API de Babylon.js
})
```

---

## 🔵 Node3D - Nodos Esféricos 3D

### Descripción
Crea nodos esféricos con efectos de glow, core interno, sombras y animación de vibración 4D.

### Método Principal
```typescript
Node3D.create(
  scene: BABYLON.Scene,
  nodeData: NodeData,
  shadowGenerator: BABYLON.ShadowGenerator // ⭐ Sistema de sombras integrado
): BABYLON.Mesh
```

### Interface NodeData (Datos de Entrada)
```typescript
interface NodeData {
  id: string;      // Identificador único del nodo
  x: number;       // Posición en eje X (horizontal)
  y: number;       // Posición en eje Y (profundidad)
  z: number;       // Posición en eje Z (altura = nivel energético)
  size: number;    // Tamaño del nodo (diámetro base: 1.5-3.5)
  energy: number;  // Nivel de energía (0-1, afecta vibración)
  label: string;   // Nombre descriptivo
  color: string;   // Color hexadecimal (#ff00ff)
  type: string;    // 'self' | 'project' | 'relationship' | 'intention' | 'manifestation'
}
```

### Elementos Generados por Nodo

#### 1. Esfera Principal
```typescript
{
  diameter: nodeData.size,
  segments: 32,
  position: Vector3(x, z, y), // Nota: Y y Z intercambiados para perspectiva
  material: {
    diffuseColor: color,
    emissiveColor: color * 0.4,  // ⭐ Emisión para efecto luminoso
    specularPower: 32,
    alpha: 0.95
  }
}

// ⭐ Una línea para agregar sombras (ventaja de Babylon.js)
shadowGenerator.addShadowCaster(sphere)
```

#### 2. Halo Glow (Aureola Externa)
```typescript
{
  diameter: nodeData.size * 1.5,  // 50% más grande
  segments: 16,
  material: {
    emissiveColor: color,         // ⭐ Solo emisión = glow puro
    alpha: 0.15,
    alphaMode: ALPHA_ADD          // ⭐ Mezcla aditiva para luminosidad
  }
}
```

#### 3. Core (Núcleo Brillante)
```typescript
{
  diameter: nodeData.size * 0.4,  // 40% del tamaño
  segments: 16,
  material: {
    emissiveColor: white,         // Blanco brillante
    alpha: 0.9
  }
}
```

#### 4. Animación de Vibración 4D
```typescript
scene.registerBeforeRender(() => {
  // Vibración vertical proporcional a energía
  vibration = sin(time * 2) * 0.05 * nodeData.energy

  // Pulsación del glow
  pulse = 1 + sin(time) * 0.1
  glow.scaling.setAll(pulse)

  // Variación de brillo del core
  coreIntensity = 0.7 + sin(time * 3) * 0.3
})
```

---

## 🔗 Link3D - Conexiones entre Nodos

### Descripción
Crea tubos 3D volumétricos que conectan nodos con animación de flujo de energía.

### Método Principal
```typescript
Link3D.create(
  scene: BABYLON.Scene,
  sourceNode: NodeData,
  targetNode: NodeData,
  linkData: LinkData
): BABYLON.Mesh
```

### Interface LinkData (Datos de Entrada)
```typescript
interface LinkData {
  source: string;   // ID del nodo origen
  target: string;   // ID del nodo destino
  strength: number; // Fuerza de conexión (0-1)
}
```

### Elementos Generados

#### Tubo 3D de Conexión
```typescript
// ⭐ CreateTube de Babylon.js genera geometría volumétrica automáticamente
const tube = BABYLON.MeshBuilder.CreateTube('link', {
  path: [
    Vector3(source.x, source.z, source.y),
    Vector3(target.x, target.z, target.y)
  ],
  radius: 0.08 * linkData.strength,  // Radio según fuerza
  cap: CAP_ALL,                       // Tapas en ambos extremos
  tessellation: 16
})

tube.material = {
  emissiveColor: RGB(0.3, 0.8, 1),   // Cyan luminoso
  alpha: 0.4 + strength * 0.3,        // Más opaco = conexión más fuerte
  alphaMode: ALPHA_ADD                // Efecto de energía
}
```

#### Animación de Flujo Energético
```typescript
scene.registerBeforeRender(() => {
  // Pulso de energía
  pulse = 0.6 + sin(time * 2) * 0.4
  material.alpha = baseAlpha * pulse

  // Variación cromática sutil
  hue = 0.5 + sin(time) * 0.1
  material.emissiveColor = RGB(hue * 0.3, hue * 0.8, 1)
})
```

---

## ✨ Particles3D - Sistema de Partículas

### Descripción
Crea ambiente inmersivo con dos sistemas de partículas: ambientales y de energía.

### Método Principal
```typescript
Particles3D.create(scene: BABYLON.Scene): void
```

### ⭐ Ventaja de Babylon.js
El `ParticleSystem` de Babylon.js maneja **2500 partículas** con alto rendimiento sin librerías adicionales.

### Sistema 1: Partículas Ambientales (2000)
```typescript
const particles = new BABYLON.ParticleSystem('ambient', 2000, scene)

{
  emitBox: {
    min: Vector3(-40, -5, -40),
    max: Vector3(40, 20, 40)
  },
  colors: {
    color1: RGBA(0, 0.8, 1, 0.8),    // Cyan
    color2: RGBA(0.5, 0.3, 1, 0.6),  // Púrpura
    colorDead: RGBA(0, 0, 0, 0)      // Desvanecimiento
  },
  size: { min: 0.1, max: 0.4 },
  lifeTime: { min: 5, max: 10 },     // Segundos
  emitRate: 50,                       // Partículas/segundo
  direction: {
    dir1: Vector3(-0.5, 0.5, -0.5),
    dir2: Vector3(0.5, 1, 0.5)
  },
  power: { min: 0.2, max: 0.5 },
  gravity: Vector3(0, 0.2, 0),        // Leve ascenso flotante
  blendMode: BLENDMODE_ADD            // ⭐ Brillo aditivo
}
```

### Sistema 2: Partículas de Energía (500)
```typescript
const energy = new BABYLON.ParticleSystem('energy', 500, scene)

{
  emitBox: {
    min: Vector3(-30, 0, -30),
    max: Vector3(30, 15, 30)
  },
  colors: {
    color1: RGBA(1, 0.5, 1, 1),      // Magenta brillante
    color2: RGBA(0.5, 1, 1, 0.8)     // Cyan claro
  },
  size: { min: 0.2, max: 0.6 },
  lifeTime: { min: 3, max: 6 },
  emitRate: 20,
  power: { min: 0.5, max: 1 },
  gravity: Vector3(0, 0.1, 0)
}
```

---

## 🎬 Scene3D - Orquestador Principal

### Descripción
Componente React que integra todos los elementos geométricos, maneja el estado y la interacción del usuario.

### Datos de la API (`/api/tablero-3d`)

#### Request
```http
GET /api/tablero-3d
Authorization: Bearer {session}
```

#### Response
```typescript
interface APIResponse {
  success: boolean;
  nodes: NodeData[];
  links: LinkData[];
  stats: {
    total: number;          // Total de nodos
    avgEnergy: number;      // Energía promedio (%)
    connections: number;    // Total de conexiones
    breakdown?: {
      projects: number;
      relationships: number;
      intentions: number;
      manifestations: number;
    };
    coherence?: {
      overall: number;
      emotional: number;
      logical: number;
      energetic: number;
    };
  };
}
```

### Configuración de Cámara
```typescript
// ⭐ ArcRotateCamera de Babylon.js - control orbital completo
const camera = new BABYLON.ArcRotateCamera('camera', ...)

{
  alpha: Math.PI / 4,         // Rotación horizontal inicial (45°)
  beta: Math.PI / 3,          // Rotación vertical inicial (60°)
  radius: 150,                // Distancia inicial
  target: Vector3(0, 20, 0),  // Punto de enfoque central
  lowerRadiusLimit: 30,       // Zoom máximo (cerca)
  upperRadiusLimit: 250,      // Zoom mínimo (lejos)
  fov: 0.6,                   // Campo de visión
  wheelPrecision: 15,         // Sensibilidad del scroll
  panningSensibility: 30,     // Sensibilidad del paneo
  inertia: 0.7                // Suavidad de movimiento
}
```

### Configuración de Iluminación
```typescript
// Luz Hemisférica (ambiental suave)
const ambient = new BABYLON.HemisphericLight('light', Vector3(0, 1, 0))
{
  intensity: 0.7,
  diffuse: RGB(0.9, 0.95, 1),      // Tono frío
  groundColor: RGB(0.1, 0.1, 0.2)  // Reflejo del suelo
}

// Luz Direccional (para sombras)
const directional = new BABYLON.DirectionalLight('dir', Vector3(0.5, -1, 0.3))
{
  intensity: 0.9,
  position: Vector3(30, 80, 30)
}

// ⭐ Generador de Sombras (una de las mayores ventajas de Babylon.js)
const shadows = new BABYLON.ShadowGenerator(2048, directional)
{
  mapSize: 2048,                      // Resolución del shadow map
  useBlurExponentialShadowMap: true,  // Sombras suaves con blur
  blurKernel: 64,                     // Intensidad del blur
  darkness: 0.4                       // Oscuridad de las sombras
}
```

---

## 🎨 Tipos de Nodos y Colores

| Tipo | Color | Hex | Descripción |
|------|-------|-----|-------------|
| `self` | Cyan | `#00ffff` | El Observador central |
| `project` | Magenta | `#ff00ff` | Proyectos activos |
| `relationship` | Naranja | `#ffaa00` | Relaciones personales |
| `intention` | Verde | `#00ff88` | Intenciones y metas |
| `manifestation` | Rosa | `#ff0088` | Manifestaciones logradas |

---

## 🔄 Flujo de Datos

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Base de       │────▶│  /api/tablero-3d │────▶│   Scene3D.tsx   │
│   Datos         │     │   (API Route)    │     │   (Estado)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                              ┌───────────────────────────────────────┐
                              │         Motor Babylon.js              │
                              │  ⭐ Sombras, Partículas, Glow nativos │
                              ├───────────────┬───────────────────────┤
                              │   Grid3D.ts   │   Particles3D.ts      │
                              ├───────────────┼───────────────────────┤
                              │   Node3D.ts   │   Link3D.ts           │
                              └───────────────┴───────────────────────┘
                                                         │
                                                         ▼
                              ┌───────────────────────────────────────┐
                              │           Canvas WebGL2               │
                              │      (Renderizado 60 FPS)             │
                              └───────────────────────────────────────┘
```

---

## 📊 Resumen de Parámetros Clave

### Para agregar un nuevo nodo:
```typescript
{
  id: "unique_id",           // Identificador único
  x: 0,                      // Posición X (-50 a 50 típico)
  y: 0,                      // Posición Y (-50 a 50 típico)
  z: 30,                     // Altura (0-60, más alto = más energía visual)
  size: 2.0,                 // Tamaño (1.5-3.5 típico)
  energy: 0.8,               // Energía 0-1 (afecta vibración y brillo)
  label: "Mi Nodo",          // Nombre visible en UI
  color: "#ff00ff",          // Color hexadecimal
  type: "project"            // Tipo de nodo (determina icono en filtros)
}
```

### Para agregar una conexión:
```typescript
{
  source: "node_id_1",       // ID del nodo origen
  target: "node_id_2",       // ID del nodo destino
  strength: 0.8              // Fuerza 0-1 (afecta grosor y opacidad del tubo)
}
```

---

## 🚀 Uso Práctico

La escena se carga automáticamente en `/tablero-3d` y:

1. **Carga datos** desde la API si el usuario está autenticado
2. **Usa datos de ejemplo** si no hay autenticación o datos
3. **Permite filtrar** nodos por tipo (botón "Filtrar Nodos")
4. **Modo Debug** para exagerar alturas y visualizar mejor la dimensión Z
5. **Interacción** con nodos mediante click (muestra panel de detalles)
6. **Controles de cámara**: 
   - 🖱️ Scroll: Zoom in/out
   - 🖱️ Click + Arrastrar: Rotar vista
   - 🖱️ Click derecho + Arrastrar: Paneo lateral

---

## 🏆 Resumen: ¿Por qué Babylon.js?

| Necesidad del Proyecto | Solución Babylon.js |
|------------------------|---------------------|
| Sombras realistas | `ShadowGenerator` en 3 líneas |
| Partículas ambientales | `ParticleSystem` nativo (2500 partículas) |
| Efectos glow/emisivos | `emissiveColor` + `ALPHA_ADD` |
| Animaciones fluidas | `registerBeforeRender` optimizado |
| Performance | WebGL2 + optimizaciones internas |
| TypeScript | Tipado completo incluido |
| Futuro | WebGPU ready para próxima generación |

**Babylon.js permite crear el Tablero 3D completo con ~400 líneas de código**, mientras que alternativas requerirían significativamente más configuración y dependencias adicionales.

---

*Documentación técnica para OBSERVADOR4D - Sistema de Visualización Dimensional*
*Motor: Babylon.js 7.35.0*
