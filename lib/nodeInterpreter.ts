/**
 * Motor de Significado - OBSERVADOR4D
 * 
 * Convierte métricas geométricas en interpretaciones accionables.
 * Cada nodo debe decir algo, cada conexión debe significar algo.
 */

// Tipos
export interface NodeData {
  id: string;
  x: number;
  y: number;
  z: number;
  size: number;
  energy: number;
  label: string;
  color: string;
  type: 'self' | 'project' | 'relationship' | 'intention' | 'manifestation' | string;
  coherence?: number;
  metadata?: Record<string, any>;
}

export interface LinkData {
  source: string;
  target: string;
  strength: number;
}

export type NodeStatus = 'Flujo' | 'Expansión' | 'Estable' | 'Fricción' | 'Saturación' | 'Colapso';
export type Urgency = 'low' | 'medium' | 'high' | 'critical';
export type ActionType = 'Mantener' | 'Invertir' | 'Delegar' | 'Corregir' | 'Reformular' | 'Cerrar';

export interface NodeInterpretation {
  statusLabel: NodeStatus;
  statusColor: string;
  statusEmoji: string;
  recommendation: string;
  action: ActionType;
  urgency: Urgency;
  metrics: {
    energy: number;
    coherence: number;
    connections: number;
    avgLinkStrength: number;
    score: number; // energy × connections (para ranking)
  };
}

export interface SystemAnalysis {
  healthScore: number; // 0-100
  topCritical: Array<{
    id: string;
    label: string;
    type: string;
    score: number;
    recommendation: string;
  }>;
  bottleneck: {
    id: string;
    label: string;
    type: string;
    coherence: number;
    issue: string;
  } | null;
  globalRecommendation: {
    action: ActionType;
    target: string;
    reason: string;
  };
}

// Colores por estado
const STATUS_COLORS: Record<NodeStatus, string> = {
  'Flujo': '#FFD700',      // Oro
  'Expansión': '#00FF88',  // Verde brillante
  'Estable': '#00BFFF',    // Azul cielo
  'Fricción': '#FF8C00',   // Naranja oscuro
  'Saturación': '#FF4500', // Rojo naranja
  'Colapso': '#808080',    // Gris
};

const STATUS_EMOJIS: Record<NodeStatus, string> = {
  'Flujo': '✨',
  'Expansión': '🚀',
  'Estable': '⚡',
  'Fricción': '⚠️',
  'Saturación': '🔥',
  'Colapso': '💀',
};

/**
 * Calcula la coherencia de un nodo basándose en sus métricas
 * Si no viene coherencia del servidor, la calculamos
 */
export function calculateNodeCoherence(
  node: NodeData,
  links: LinkData[]
): number {
  // Si ya tiene coherencia del servidor, usarla
  if (node.coherence !== undefined) {
    return node.coherence;
  }

  // Calcular basándose en energía y conexiones
  const nodeLinks = links.filter(l => l.source === node.id || l.target === node.id);
  const avgStrength = nodeLinks.length > 0
    ? nodeLinks.reduce((a, l) => a + l.strength, 0) / nodeLinks.length
    : 0.5;

  // Fórmula: Coherencia = (Energía × 0.6) + (Fuerza promedio × 0.4)
  return Math.min(1, Math.max(0, (node.energy * 0.6) + (avgStrength * 0.4)));
}

/**
 * Interpreta un nodo individual y devuelve su significado
 */
export function interpretNode(
  node: NodeData,
  links: LinkData[],
  systemCoherence?: number
): NodeInterpretation {
  const nodeLinks = links.filter(l => l.source === node.id || l.target === node.id);
  const connections = nodeLinks.length;
  const avgLinkStrength = connections > 0
    ? nodeLinks.reduce((a, l) => a + l.strength, 0) / connections
    : 0;
  
  const coherence = calculateNodeCoherence(node, links);
  const energy = node.energy;
  const score = energy * (connections + 1); // +1 para evitar multiplicar por 0

  // === MATRIZ DE DECISIÓN ===
  
  let statusLabel: NodeStatus;
  let recommendation: string;
  let action: ActionType;
  let urgency: Urgency;

  // FLUJO: Alta energía + Alta coherencia
  if (energy >= 0.8 && coherence >= 0.8) {
    statusLabel = 'Flujo';
    recommendation = 'Estado óptimo. Mantener ritmo actual y considerar expandir.';
    action = 'Mantener';
    urgency = 'low';
  }
  // EXPANSIÓN: Buena energía + Buena coherencia
  else if (energy >= 0.6 && coherence >= 0.6) {
    statusLabel = 'Expansión';
    recommendation = 'Buen momento para invertir más recursos y atención.';
    action = 'Invertir';
    urgency = 'low';
  }
  // ESTABLE: Energía media + Coherencia media
  else if (energy >= 0.4 && coherence >= 0.5) {
    statusLabel = 'Estable';
    recommendation = 'Estado balanceado. Monitorear y buscar oportunidades.';
    action = 'Mantener';
    urgency = 'medium';
  }
  // SATURACIÓN: Muchas conexiones + Poca energía
  else if (connections >= 4 && energy < 0.5) {
    statusLabel = 'Saturación';
    recommendation = 'Demasiadas conexiones para la energía disponible. Delegar o simplificar.';
    action = 'Delegar';
    urgency = 'high';
  }
  // FRICCIÓN: Baja coherencia (resistencia detectada)
  else if (coherence < 0.4 && energy >= 0.3) {
    statusLabel = 'Fricción';
    recommendation = 'Alta resistencia detectada. Revisar alineación y propósito.';
    action = 'Corregir';
    urgency = 'high';
  }
  // COLAPSO: Baja energía + Baja coherencia
  else if (energy < 0.3 && coherence < 0.4) {
    statusLabel = 'Colapso';
    recommendation = 'Estado crítico. Evaluar cierre o reformulación completa.';
    action = energy < 0.15 ? 'Cerrar' : 'Reformular';
    urgency = 'critical';
  }
  // DEFAULT: Fricción leve
  else {
    statusLabel = 'Fricción';
    recommendation = 'Requiere atención. Identificar bloqueos y corregir rumbo.';
    action = 'Corregir';
    urgency = 'medium';
  }

  // Ajustar recomendación según tipo de nodo
  const typeSpecificRecommendation = getTypeSpecificRecommendation(node.type, statusLabel, action);
  if (typeSpecificRecommendation) {
    recommendation = typeSpecificRecommendation;
  }

  return {
    statusLabel,
    statusColor: STATUS_COLORS[statusLabel],
    statusEmoji: STATUS_EMOJIS[statusLabel],
    recommendation,
    action,
    urgency,
    metrics: {
      energy,
      coherence,
      connections,
      avgLinkStrength,
      score,
    },
  };
}

/**
 * Recomendaciones específicas por tipo de nodo
 */
function getTypeSpecificRecommendation(
  type: string,
  status: NodeStatus,
  action: ActionType
): string | null {
  const recommendations: Record<string, Record<NodeStatus, string>> = {
    project: {
      'Flujo': 'Proyecto en estado óptimo. Considera escalar o replicar el modelo.',
      'Expansión': 'Momento ideal para acelerar. Asigna más recursos.',
      'Estable': 'Proyecto estable. Busca el siguiente milestone.',
      'Fricción': 'Revisa los obstáculos. ¿Falta claridad en objetivos?',
      'Saturación': 'Proyecto sobrecargado. Prioriza entregables y delega.',
      'Colapso': 'Evalúa si vale la pena continuar. Considera pivotar.',
    },
    relationship: {
      'Flujo': 'Relación nutritiva. Cultívala y agradécela.',
      'Expansión': 'Buen momento para profundizar la conexión.',
      'Estable': 'Relación funcional. Mantén la comunicación.',
      'Fricción': 'Hay tensión. Inicia una conversación honesta.',
      'Saturación': 'Demasiada demanda. Establece límites saludables.',
      'Colapso': 'Relación desgastada. Evalúa si es momento de soltar.',
    },
    intention: {
      'Flujo': 'Intención alineada. Mantén el momentum.',
      'Expansión': 'Tu práctica está dando frutos. Aumenta la frecuencia.',
      'Estable': 'Progreso constante. No pierdas consistencia.',
      'Fricción': 'La intención encuentra resistencia. Revisa tu "por qué".',
      'Saturación': 'Demasiadas intenciones activas. Enfócate en las esenciales.',
      'Colapso': 'Intención abandonada. ¿Sigue siendo relevante para ti?',
    },
    manifestation: {
      'Flujo': 'Manifestación en camino. Mantén la visión clara.',
      'Expansión': 'Se acerca la materialización. Prepárate para recibir.',
      'Estable': 'Proceso activo. Paciencia y acción alineada.',
      'Fricción': 'Bloqueos en la manifestación. Revisa creencias limitantes.',
      'Saturación': 'Muchos deseos simultáneos. Prioriza lo esencial.',
      'Colapso': 'Manifestación estancada. Reformula o libera.',
    },
  };

  return recommendations[type]?.[status] || null;
}

/**
 * Analiza el sistema completo para el Modo Decisión
 */
export function analyzeSystem(
  nodes: NodeData[],
  links: LinkData[],
  systemCoherence?: { overall: number; emotional: number; logical: number; energetic: number }
): SystemAnalysis {
  // Interpretar todos los nodos
  const interpretations = nodes.map(node => ({
    node,
    interpretation: interpretNode(node, links, systemCoherence?.overall),
  }));

  // Calcular health score
  const avgCoherence = interpretations.reduce((a, i) => a + i.interpretation.metrics.coherence, 0) / interpretations.length;
  const avgEnergy = interpretations.reduce((a, i) => a + i.interpretation.metrics.energy, 0) / interpretations.length;
  const criticalCount = interpretations.filter(i => i.interpretation.urgency === 'critical').length;
  const highCount = interpretations.filter(i => i.interpretation.urgency === 'high').length;

  // Health = (coherencia + energía) / 2, penalizado por nodos críticos
  let healthScore = Math.round(((avgCoherence + avgEnergy) / 2) * 100);
  healthScore = Math.max(0, healthScore - (criticalCount * 15) - (highCount * 5));

  // Top 3 críticos (por score = energy × connections)
  const sorted = [...interpretations]
    .filter(i => i.node.type !== 'self') // Excluir el observador
    .sort((a, b) => b.interpretation.metrics.score - a.interpretation.metrics.score);

  const topCritical = sorted.slice(0, 3).map(i => ({
    id: i.node.id,
    label: i.node.label,
    type: i.node.type,
    score: Math.round(i.interpretation.metrics.score * 100),
    recommendation: i.interpretation.recommendation,
  }));

  // Cuello de botella: nodo con peor coherencia que tenga conexiones
  const bottleneckCandidate = interpretations
    .filter(i => i.node.type !== 'self' && i.interpretation.metrics.connections > 0)
    .sort((a, b) => a.interpretation.metrics.coherence - b.interpretation.metrics.coherence)[0];

  const bottleneck = bottleneckCandidate && bottleneckCandidate.interpretation.metrics.coherence < 0.5
    ? {
        id: bottleneckCandidate.node.id,
        label: bottleneckCandidate.node.label,
        type: bottleneckCandidate.node.type,
        coherence: bottleneckCandidate.interpretation.metrics.coherence,
        issue: bottleneckCandidate.interpretation.recommendation,
      }
    : null;

  // Recomendación global
  let globalAction: ActionType;
  let globalTarget: string;
  let globalReason: string;

  if (healthScore >= 70) {
    globalAction = 'Mantener';
    globalTarget = 'Sistema general';
    globalReason = 'El sistema está saludable. Enfócate en optimizar los nodos en Expansión.';
  } else if (healthScore >= 50) {
    if (bottleneck) {
      globalAction = 'Corregir';
      globalTarget = bottleneck.label;
      globalReason = `Este nodo está generando fricción en el sistema. Prioriza su corrección.`;
    } else {
      globalAction = 'Invertir';
      globalTarget = topCritical[0]?.label || 'Proyectos principales';
      globalReason = 'Aumenta energía en tus prioridades para mejorar el flujo general.';
    }
  } else if (healthScore >= 30) {
    globalAction = 'Delegar';
    globalTarget = 'Tareas operativas';
    globalReason = 'Sistema sobrecargado. Libera capacidad delegando lo no esencial.';
  } else {
    globalAction = 'Reformular';
    globalTarget = 'Estrategia completa';
    globalReason = 'El sistema necesita una revisión profunda. Simplifica y reenfoca.';
  }

  return {
    healthScore,
    topCritical,
    bottleneck,
    globalRecommendation: {
      action: globalAction,
      target: globalTarget,
      reason: globalReason,
    },
  };
}

/**
 * Obtiene el color Wolcoff basado en coherencia
 */
export function getWolcoffColor(coherence: number): string {
  if (coherence >= 0.8) return '#FFD700'; // Oro - Flujo
  if (coherence >= 0.6) return '#00BFFF'; // Azul - Orden
  if (coherence >= 0.4) return '#FF8C00'; // Naranja - Fricción
  if (coherence >= 0.2) return '#FF4500'; // Rojo - Ego
  return '#808080'; // Gris - Colapso
}

/**
 * Calcula el nivel de distorsión para la geometría Wolcoff
 */
export function getWolcoffDistortion(coherence: number): {
  distortion: number;
  vibrationSpeed: number;
  glowStability: number;
  scaleVariance: number;
} {
  const distortion = 1 - coherence;
  
  return {
    distortion,
    vibrationSpeed: 1 + distortion * 4, // Más rápido cuando hay más distorsión
    glowStability: coherence, // Más estable con alta coherencia
    scaleVariance: distortion * 0.3, // Más variación de escala con baja coherencia
  };
}

