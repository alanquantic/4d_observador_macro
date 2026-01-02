
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/daily-mapping/questions - Generate reflective questions
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get recent entries to contextualize questions
    const recentEntries = await prisma.dailyEntry.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 7,
      include: {
        emotions: true,
      },
    });

    // Get active intentions
    const intentions = await prisma.intention.findMany({
      where: {
        userId: user.id,
        status: 'active',
      },
      take: 5,
    });

    // Get recent patterns
    const patterns = await prisma.pattern.findMany({
      where: { userId: user.id },
      orderBy: { lastObserved: 'desc' },
      take: 3,
    });

    // Build context for AI
    const context = {
      recentMood: recentEntries.length > 0 ? recentEntries[0].emotionalState : null,
      recentEnergyLevels: recentEntries.map(e => e.energyLevel),
      activeIntentions: intentions.map(i => i.title),
      detectedPatterns: patterns.map(p => p.title),
      entryCount: recentEntries.length,
      dayOfWeek: new Date().toLocaleDateString('es-ES', { weekday: 'long' }),
    };

    // Call Gemini AI to generate questions
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/gemini/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Eres un guía de consciencia 4D para la app "Observador 4D". Genera 5 preguntas reflexivas profundas para el usuario basadas en este contexto:

Contexto del Usuario:
- Estado emocional reciente: ${context.recentMood || 'No disponible'}/10
- Niveles de energía última semana: ${context.recentEnergyLevels.join(', ')}
- Intenciones activas: ${context.activeIntentions.join(', ') || 'Ninguna'}
- Patrones detectados: ${context.detectedPatterns.join(', ') || 'Ninguno'}
- Día de hoy: ${context.dayOfWeek}

Las preguntas deben:
1. Invitar a la auto-observación desde una perspectiva macro (4D)
2. Conectar con los patrones y tendencias recientes
3. Ser profundas pero prácticas
4. Ayudar a tomar decisiones desde una vista elevada
5. Fomentar la consciencia de sincronicidades

Formato de respuesta: Lista numerada de 5 preguntas, una por línea. Sin introducción ni conclusión.`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate questions with AI');
    }

    const data = await response.json();
    const questionsText = data.response || '';
    
    // Parse questions from AI response
    const questions = questionsText
      .split('\n')
      .filter((line: string) => line.trim() && /^\d+\./.test(line.trim()))
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((q: string) => q.length > 10);

    return NextResponse.json({
      questions: questions.slice(0, 5),
      context,
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    
    // Fallback questions if AI fails
    const fallbackQuestions = [
      "¿Qué patrones observas en tu vida esta semana desde una perspectiva 4D?",
      "¿Cómo se alinean tus acciones de hoy con tus intenciones más profundas?",
      "¿Qué sincronicidades has notado recientemente que podrían ser señales?",
      "Desde la vista macro, ¿qué decisión de hoy tendrá mayor impacto en tu futuro?",
      "¿Qué aspecto de tu vida necesita más atención desde tu rol de observador?",
    ];
    
    return NextResponse.json({
      questions: fallbackQuestions,
      context: {},
      fallback: true,
    });
  }
}
