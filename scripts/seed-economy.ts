/**
 * Script para poblar datos de prueba de la Economía Agéntica
 * Crea proyectos externos y decisiones simuladas
 * 
 * Ejecutar con: npx ts-node scripts/seed-economy.ts
 */

import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

// Generar API Key única
function generateApiKey(): { apiKey: string; apiKeyPrefix: string } {
  const key = `obs_${randomBytes(24).toString('hex')}`;
  return {
    apiKey: key,
    apiKeyPrefix: key.substring(0, 12) + '...',
  };
}

// Tipos de decisiones simuladas
const DECISION_TYPES = [
  { context: 'pricing_request', actions: ['increase_price', 'decrease_price', 'maintain_price'], labels: ['⬆️ Precio aumentado', '⬇️ Precio reducido', '➡️ Precio mantenido'] },
  { context: 'risk_assessment', actions: ['approve', 'reject', 'request_review'], labels: ['✅ Aprobado', '❌ Rechazado', '🔍 Revisión solicitada'] },
  { context: 'churn_prediction', actions: ['offer_discount', 'send_retention', 'flag_high_risk'], labels: ['🎁 Descuento ofrecido', '📧 Email de retención', '⚠️ Alto riesgo marcado'] },
  { context: 'document_analysis', actions: ['process_normal', 'flag_suspicious', 'escalate'], labels: ['📄 Procesado normal', '🚩 Sospechoso', '📢 Escalado'] },
  { context: 'payment_processing', actions: ['charge_premium', 'charge_standard', 'defer_payment'], labels: ['💎 Cobro premium', '💵 Cobro estándar', '⏳ Pago diferido'] },
];

const OUTCOMES = ['accepted', 'rejected', 'pending', null];
const AGENT_NAMES = ['PriceBot', 'RiskGuard', 'RetentionAI', 'DocAnalyzer', 'PaymentEngine'];

async function main() {
  console.log('🌟 Iniciando seed de Economía Agéntica...\n');

  // Buscar el usuario de prueba
  const user = await prisma.user.findFirst({
    where: { email: 'test@observador4d.com' }
  });

  if (!user) {
    console.log('❌ Usuario test@observador4d.com no encontrado.');
    console.log('   Ejecuta primero: node scripts/seed.ts');
    return;
  }

  console.log(`✅ Usuario encontrado: ${user.email} (${user.id})\n`);

  // Crear proyectos externos
  const externalProjectsData = [
    { 
      name: 'Legal Shield', 
      description: 'IA de análisis legal con pricing dinámico',
      totalRevenue: 15420.50,
      monthlyRevenue: 3250.00,
      currentBalance: 8500.00,
      agentMode: 'auto',
    },
    { 
      name: 'Capital Miner', 
      description: 'IA de gestión de liquidez y micro-trading',
      totalRevenue: 8750.25,
      monthlyRevenue: 1890.00,
      currentBalance: 4200.00,
      agentMode: 'auto',
    },
  ];

  const createdExternalProjects: { id: string; name: string; apiKey: string }[] = [];

  for (const proj of externalProjectsData) {
    // Verificar si ya existe
    const existing = await prisma.externalProject.findFirst({
      where: { userId: user.id, name: proj.name }
    });

    if (existing) {
      // Actualizar datos
      await prisma.externalProject.update({
        where: { id: existing.id },
        data: {
          totalRevenue: proj.totalRevenue,
          monthlyRevenue: proj.monthlyRevenue,
          currentBalance: proj.currentBalance,
          agentMode: proj.agentMode,
          status: 'active',
        }
      });
      createdExternalProjects.push({ id: existing.id, name: existing.name, apiKey: existing.apiKey });
      console.log(`🔄 Proyecto externo actualizado: ${proj.name}`);
      console.log(`   API Key: ${existing.apiKey}`);
    } else {
      const { apiKey, apiKeyPrefix } = generateApiKey();
      const created = await prisma.externalProject.create({
        data: {
          userId: user.id,
          name: proj.name,
          description: proj.description,
          apiKey,
          apiKeyPrefix,
          totalRevenue: proj.totalRevenue,
          monthlyRevenue: proj.monthlyRevenue,
          currentBalance: proj.currentBalance,
          agentMode: proj.agentMode,
          status: 'active',
        }
      });
      createdExternalProjects.push({ id: created.id, name: created.name, apiKey: created.apiKey });
      console.log(`✨ Proyecto externo creado: ${proj.name}`);
      console.log(`   API Key: ${apiKey}`);
    }
  }

  // Crear decisiones simuladas para los últimos 30 días
  console.log('\n📊 Generando decisiones simuladas...\n');

  const now = new Date();
  let totalDecisions = 0;
  let totalRevenue = 0;

  for (const extProj of createdExternalProjects) {
    // Generar entre 50-100 decisiones por proyecto
    const numDecisions = Math.floor(Math.random() * 50) + 50;
    
    for (let i = 0; i < numDecisions; i++) {
      // Fecha aleatoria en los últimos 30 días
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - daysAgo);
      timestamp.setHours(timestamp.getHours() - hoursAgo);

      // Tipo de decisión aleatorio
      const decisionType = DECISION_TYPES[Math.floor(Math.random() * DECISION_TYPES.length)];
      const actionIndex = Math.floor(Math.random() * decisionType.actions.length);

      // Revenue aleatorio (más probable positivo)
      const hasRevenue = Math.random() > 0.3;
      const revenue = hasRevenue ? Math.random() * 100 + 10 : 0;

      // Outcome
      const outcome = OUTCOMES[Math.floor(Math.random() * OUTCOMES.length)];

      // Agent name
      const agentName = AGENT_NAMES[Math.floor(Math.random() * AGENT_NAMES.length)];

      await prisma.externalDecision.create({
        data: {
          projectId: extProj.id,
          timestamp,
          contextType: decisionType.context,
          actionTaken: decisionType.actions[actionIndex],
          actionLabel: decisionType.labels[actionIndex],
          inputValue: { source: 'simulation', iteration: i },
          outputValue: { processed: true, revenue },
          outcome,
          revenueGenerated: revenue,
          coherenceImpact: (Math.random() - 0.3) * 0.2, // -0.06 a 0.14
          agentName,
          riskLevel: Math.random() * 0.5, // 0 - 0.5
        }
      });

      totalDecisions++;
      totalRevenue += revenue;
    }

    console.log(`   ✅ ${numDecisions} decisiones creadas para ${extProj.name}`);
  }

  console.log(`\n🎉 Seed completado!`);
  console.log(`   Total decisiones: ${totalDecisions}`);
  console.log(`   Total revenue simulado: $${totalRevenue.toFixed(2)}`);
  console.log(`\n📱 Ahora puedes probar en:`);
  console.log(`   - /economy-view`);
  console.log(`   - /projects-hub`);
  console.log(`   - /dashboard (Agent Command Center)`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
