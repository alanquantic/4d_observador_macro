/**
 * Snapshot Service - OBSERVADOR4D
 * 
 * Servicio para crear y gestionar snapshots de nodos automáticamente.
 * Se llama cuando hay cambios significativos en proyectos, relaciones, etc.
 */

import { prisma } from '@/lib/db';

interface SnapshotData {
  userId: string;
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  energy: number;
  coherence: number;
  connections: number;
  triggerType?: string;
  triggerReason?: string;
}

/**
 * Crea un snapshot de un nodo si ha cambiado significativamente
 * desde el último snapshot (>10% de cambio en energía o coherencia)
 */
export async function createSnapshotIfChanged(data: SnapshotData): Promise<boolean> {
  try {
    // Buscar el último snapshot de este nodo
    const lastSnapshot = await prisma.nodeSnapshot.findFirst({
      where: {
        userId: data.userId,
        nodeId: data.nodeId,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Si no hay snapshot previo, crear uno
    if (!lastSnapshot) {
      await prisma.nodeSnapshot.create({ 
        data: {
          userId: data.userId,
          nodeId: data.nodeId,
          nodeType: data.nodeType,
          nodeLabel: data.nodeLabel,
          energy: data.energy,
          coherence: data.coherence,
          connections: data.connections,
          triggerType: data.triggerType || 'auto',
          triggerReason: data.triggerReason || 'Snapshot inicial',
        }
      });
      return true;
    }

    // Calcular diferencia
    const energyDiff = Math.abs(data.energy - lastSnapshot.energy);
    const coherenceDiff = Math.abs(data.coherence - lastSnapshot.coherence);
    const connectionsDiff = Math.abs(data.connections - lastSnapshot.connections);

    // Crear snapshot si hay cambio significativo (>10% o cambio en conexiones)
    if (energyDiff > 0.1 || coherenceDiff > 0.1 || connectionsDiff > 0) {
      let reason = '';
      if (energyDiff > 0.1) reason += `Energía cambió ${(energyDiff * 100).toFixed(0)}%. `;
      if (coherenceDiff > 0.1) reason += `Coherencia cambió ${(coherenceDiff * 100).toFixed(0)}%. `;
      if (connectionsDiff > 0) reason += `Conexiones cambiaron de ${lastSnapshot.connections} a ${data.connections}.`;
      
      await prisma.nodeSnapshot.create({ 
        data: {
          userId: data.userId,
          nodeId: data.nodeId,
          nodeType: data.nodeType,
          nodeLabel: data.nodeLabel,
          energy: data.energy,
          coherence: data.coherence,
          connections: data.connections,
          triggerType: 'auto',
          triggerReason: reason.trim(),
        }
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error creating snapshot:', error);
    return false;
  }
}

/**
 * Crea snapshots para todos los nodos de un usuario
 * Útil para el Onboarding o actualizaciones masivas
 */
export async function createFullSnapshot(userId: string): Promise<number> {
  try {
    // Obtener todos los datos del usuario
    const [projects, relationships, intentions, manifestations] = await Promise.all([
      prisma.project.findMany({ where: { userId } }),
      prisma.relationship.findMany({ where: { userId } }),
      prisma.intention.findMany({ where: { userId } }),
      prisma.manifestation.findMany({ where: { userId } }),
    ]);

    // Contar conexiones por tipo
    const projectCount = projects.length;
    const relationshipCount = relationships.length;

    let snapshotsCreated = 0;

    // Snapshot de proyectos
    for (const project of projects) {
      const energy = (project.energyInvested + project.impactLevel) / 20;
      const coherence = project.coherenceScore ? project.coherenceScore / 100 : energy;
      
      const created = await createSnapshotIfChanged({
        userId,
        nodeId: `project_${project.id}`,
        nodeType: 'project',
        nodeLabel: project.name,
        energy: Math.min(1, Math.max(0.1, energy)),
        coherence: Math.min(1, Math.max(0.1, coherence)),
        connections: 1 + relationshipCount,
        triggerType: 'onboarding',
        triggerReason: 'Snapshot inicial de onboarding',
      });
      
      if (created) snapshotsCreated++;
    }

    // Snapshot de relaciones
    for (const relationship of relationships) {
      const energy = relationship.connectionQuality / 10;
      const coherence = relationship.importance / 10;
      
      const created = await createSnapshotIfChanged({
        userId,
        nodeId: `relationship_${relationship.id}`,
        nodeType: 'relationship',
        nodeLabel: relationship.name,
        energy: Math.min(1, Math.max(0.1, energy)),
        coherence: Math.min(1, Math.max(0.1, coherence)),
        connections: 1 + projectCount,
        triggerType: 'onboarding',
        triggerReason: 'Snapshot inicial de onboarding',
      });
      
      if (created) snapshotsCreated++;
    }

    // Snapshot de intenciones
    for (const intention of intentions) {
      const energy = intention.practiceFrequency === 'daily' ? 0.9 : 
                     intention.practiceFrequency === 'weekly' ? 0.6 : 0.3;
      const coherence = intention.alignmentScore / 100;
      
      const created = await createSnapshotIfChanged({
        userId,
        nodeId: `intention_${intention.id}`,
        nodeType: 'intention',
        nodeLabel: intention.title,
        energy: Math.min(1, Math.max(0.1, energy)),
        coherence: Math.min(1, Math.max(0.1, coherence)),
        connections: 1,
        triggerType: 'onboarding',
        triggerReason: 'Snapshot inicial de onboarding',
      });
      
      if (created) snapshotsCreated++;
    }

    // Snapshot de manifestaciones
    for (const manifestation of manifestations) {
      const energy = manifestation.manifestationStage / 100;
      const coherence = manifestation.impactLevel / 10;
      
      const created = await createSnapshotIfChanged({
        userId,
        nodeId: `manifestation_${manifestation.id}`,
        nodeType: 'manifestation',
        nodeLabel: manifestation.title,
        energy: Math.min(1, Math.max(0.1, energy)),
        coherence: Math.min(1, Math.max(0.1, coherence)),
        connections: 1,
        triggerType: 'onboarding',
        triggerReason: 'Snapshot inicial de onboarding',
      });
      
      if (created) snapshotsCreated++;
    }

    return snapshotsCreated;
  } catch (error) {
    console.error('Error creating full snapshot:', error);
    return 0;
  }
}

/**
 * Obtiene la tendencia de un nodo basándose en sus snapshots
 */
export async function getNodeTrend(
  userId: string, 
  nodeId: string, 
  days: number = 7
): Promise<'improving' | 'stable' | 'declining' | 'unknown'> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const snapshots = await prisma.nodeSnapshot.findMany({
      where: {
        userId,
        nodeId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (snapshots.length < 2) return 'unknown';

    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];

    const energyChange = last.energy - first.energy;
    const coherenceChange = last.coherence - first.coherence;
    const avgChange = (energyChange + coherenceChange) / 2;

    if (avgChange > 0.05) return 'improving';
    if (avgChange < -0.05) return 'declining';
    return 'stable';
  } catch (error) {
    console.error('Error getting node trend:', error);
    return 'unknown';
  }
}

