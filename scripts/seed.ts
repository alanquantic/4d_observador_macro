
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌟 Iniciando seeding de la base de datos OBSERVADOR 4D...');

  // Crear usuario de prueba principal (oculto del usuario)
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'Admin Observer',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('👤 Usuario admin creado:', adminUser.email);

  // Crear usuario de demostración con datos de ejemplo
  const demoPassword = await bcrypt.hash('demo123', 12);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@observador4d.com' },
    update: {},
    create: {
      email: 'demo@observador4d.com',
      name: 'Explorador 4D',
      password: demoPassword,
      role: 'user',
    },
  });

  console.log('👤 Usuario demo creado:', demoUser.email);

  // Crear datos de ejemplo para el usuario demo
  
  // 1. Proyectos de ejemplo
  const sampleProjects = await Promise.all([
    prisma.project.create({
      data: {
        userId: demoUser.id,
        name: 'Expansión de Conciencia',
        description: 'Desarrollo personal y elevación dimensional',
        category: 'spiritual',
        status: 'active',
        progress: 65.0,
        energyInvested: 8.5,
        impactLevel: 9.0,
        objectives: [
          { title: 'Meditación diaria', completed: true },
          { title: 'Visualización 4D', completed: false },
          { title: 'Registro de sincronicidades', completed: true }
        ],
        nextSteps: [
          'Practicar visualización desde perspectiva superior',
          'Integrar ejercicios de observador'
        ]
      }
    }),
    prisma.project.create({
      data: {
        userId: demoUser.id,
        name: 'Manifestación Estratégica',
        description: 'Aplicar principios 4D en objetivos materiales',
        category: 'professional',
        status: 'active',
        progress: 40.0,
        energyInvested: 7.0,
        impactLevel: 8.5,
        objectives: [
          { title: 'Definir visión desde macroperspectiva', completed: true },
          { title: 'Alinear acciones con intención', completed: false }
        ]
      }
    })
  ]);

  console.log(`📋 ${sampleProjects.length} proyectos de ejemplo creados`);

  // 2. Relaciones de ejemplo
  const sampleRelationships = await Promise.all([
    prisma.relationship.create({
      data: {
        userId: demoUser.id,
        name: 'Mentor Espiritual',
        relationshipType: 'mentor',
        connectionQuality: 9.0,
        energyExchange: 'receiving',
        importance: 9.5,
        contactFrequency: 'weekly',
        tags: ['guidance', 'wisdom', 'spiritual']
      }
    }),
    prisma.relationship.create({
      data: {
        userId: demoUser.id,
        name: 'Círculo de Manifestadores',
        relationshipType: 'spiritual',
        connectionQuality: 8.5,
        energyExchange: 'balanced',
        importance: 8.0,
        contactFrequency: 'monthly',
        tags: ['manifestation', 'support', 'community']
      }
    })
  ]);

  console.log(`🤝 ${sampleRelationships.length} relaciones de ejemplo creadas`);

  // 3. Manifestaciones de ejemplo
  const sampleManifestations = await Promise.all([
    prisma.manifestation.create({
      data: {
        userId: demoUser.id,
        title: 'Flujo Financiero Abundante',
        description: 'Manifestar estabilidad y crecimiento económico desde la perspectiva 4D',
        category: 'wealth',
        timeframe: 'medium_term',
        energyRequired: 7.5,
        impactLevel: 9.0,
        status: 'action',
        manifestationStage: 30.0,
        specificGoals: [
          'Aumentar ingresos pasivos',
          'Crear múltiples fuentes de ingreso',
          'Mantener flujo positivo de dinero'
        ],
        actionSteps: [
          'Visualización diaria del estado ya manifestado',
          'Acciones alineadas desde la macrovisión',
          'Gratitud por la abundancia presente'
        ]
      }
    }),
    prisma.manifestation.create({
      data: {
        userId: demoUser.id,
        title: 'Relaciones Conscientes',
        description: 'Atraer y cultivar relaciones desde la conciencia 4D',
        category: 'relationships',
        timeframe: 'long_term',
        energyRequired: 6.0,
        impactLevel: 8.5,
        status: 'manifesting',
        manifestationStage: 60.0,
        specificGoals: [
          'Conexiones auténticas y profundas',
          'Comunicación desde el corazón',
          'Relaciones mutuamente enriquecedoras'
        ]
      }
    })
  ]);

  console.log(`🎯 ${sampleManifestations.length} manifestaciones de ejemplo creadas`);

  // 4. Entradas diarias de ejemplo (últimos 7 días)
  const today = new Date();
  const dailyEntries = [];

  for (let i = 6; i >= 0; i--) {
    const entryDate = new Date(today);
    entryDate.setDate(today.getDate() - i);
    
    const entry = await prisma.dailyEntry.create({
      data: {
        userId: demoUser.id,
        date: entryDate,
        emotionalState: 7.0 + Math.random() * 2, // 7-9 range
        energyLevel: 6.0 + Math.random() * 3,    // 6-9 range
        coherenceLevel: 70 + Math.random() * 20, // 70-90 range
        events: [
          {
            title: 'Meditación matutina',
            description: 'Sesión de expansión de conciencia',
            impact: 'positive',
            timestamp: '07:00'
          },
          {
            title: 'Trabajo en manifestaciones',
            description: 'Visualización y acciones alineadas',
            impact: 'positive', 
            timestamp: '14:30'
          }
        ],
        plannedActions: [
          'Meditar por 20 minutos',
          'Revisar proyectos activos',
          'Practicar visualización 4D'
        ],
        actualActions: [
          'Meditación completada',
          'Proyectos revisados',
          'Visualización practicada'
        ],
        alignmentScore: 85 + Math.random() * 10,
        synchronicities: 'Número 11:11 visto en momentos de reflexión profunda',
        synchronicitiesData: [
          {
            title: 'Número 11:11',
            description: 'Visto en momentos de reflexión profunda',
            significance: 'confirmation'
          }
        ]
      }
    });
    
    dailyEntries.push(entry);
  }

  console.log(`📅 ${dailyEntries.length} entradas diarias de ejemplo creadas`);

  // 5. Métricas de usuario de ejemplo
  const sampleMetrics = await prisma.userMetrics.create({
    data: {
      userId: demoUser.id,
      overallCoherence: 78.5,
      emotionalCoherence: 82.0,
      logicalCoherence: 75.0,
      energeticCoherence: 79.0,
      synchronicityCount: 15,
      synchronicityScore: 8.2,
      manifestationRate: 65.0,
      projectCompletion: 58.0,
      relationshipHealth: 85.0,
      weeklyTrend: 'improving',
      dominantPatterns: [
        { pattern: 'morning_meditation', frequency: 0.85 },
        { pattern: 'afternoon_manifestation', frequency: 0.72 },
        { pattern: 'evening_reflection', frequency: 0.68 }
      ]
    }
  });

  console.log('📊 Métricas de usuario de ejemplo creadas');

  console.log('\n🎉 Seeding completado exitosamente!');
  console.log('\n📝 Credenciales de acceso:');
  console.log('   Demo User: demo@observador4d.com / demo123');
  console.log('   (Admin user credentials are hidden for security)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
