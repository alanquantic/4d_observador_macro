
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Obtener eventos del pasado (últimas entradas diarias)
    const pastEntries = await prisma.dailyEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
      select: {
        id: true,
        date: true,
        events: true,
        decisions: true,
        emotionalState: true,
        energyLevel: true,
        coherenceLevel: true
      }
    });

    // Procesar eventos del pasado
    const pastEvents = pastEntries
      .map(entry => {
        const events = (entry.events as any[]) || [];
        const decisions = (entry.decisions as any[]) || [];
        
        return [
          ...events.map(event => ({
            ...event,
            type: 'event',
            date: entry.date,
            timeline: 'past'
          })),
          ...decisions.map(decision => ({
            ...decision,
            type: 'decision',
            date: entry.date,
            timeline: 'past'
          }))
        ];
      })
      .flat();

    // Obtener proyectos futuros
    const futureProjects = await prisma.project.findMany({
      where: {
        userId,
        targetDate: {
          gte: new Date()
        },
        status: {
          in: ['active', 'paused']
        }
      },
      orderBy: { targetDate: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        targetDate: true,
        progress: true,
        category: true,
        impactLevel: true
      }
    });

    // Procesar eventos futuros
    const futureEvents = futureProjects.map(project => ({
      id: project.id,
      title: project.name,
      description: project.description,
      type: 'project',
      date: project.targetDate,
      timeline: 'future',
      progress: project.progress,
      category: project.category,
      impact: project.impactLevel
    }));

    // Obtener manifestaciones futuras
    const manifestations = await prisma.manifestation.findMany({
      where: {
        userId,
        status: {
          in: ['intention', 'action', 'manifesting']
        }
      },
      orderBy: { intendedBy: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        intendedBy: true,
        manifestationStage: true,
        category: true,
        impactLevel: true,
        timeframe: true
      }
    });

    const manifestationEvents = manifestations.map(manifestation => ({
      id: manifestation.id,
      title: manifestation.title,
      description: manifestation.description,
      type: 'manifestation',
      date: manifestation.intendedBy,
      timeline: 'future',
      progress: manifestation.manifestationStage,
      category: manifestation.category,
      impact: manifestation.impactLevel,
      timeframe: manifestation.timeframe
    }));

    // Combinar y ordenar eventos
    const allEvents = [
      ...pastEvents.slice(0, 20),
      ...futureEvents,
      ...manifestationEvents
    ].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    return NextResponse.json({
      events: allEvents,
      summary: {
        pastEventsCount: pastEvents.length,
        futureEventsCount: futureEvents.length + manifestationEvents.length,
        activeProjectsCount: futureProjects.length,
        manifestationsCount: manifestations.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo timeline:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await request.json();

    if (data.timeline === 'past') {
      // Agregar evento al pasado (entrada diaria)
      const eventDate = new Date(data.date);
      eventDate.setHours(0, 0, 0, 0);

      let dailyEntry = await prisma.dailyEntry.findFirst({
        where: {
          userId,
          date: {
            gte: eventDate,
            lt: new Date(eventDate.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      if (!dailyEntry) {
        dailyEntry = await prisma.dailyEntry.create({
          data: {
            userId,
            date: eventDate,
            emotionalState: 5.0,
            energyLevel: 5.0,
            events: [],
            decisions: []
          }
        });
      }

      const currentEvents = (dailyEntry.events as any[]) || [];
      const newEvent = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        impact: data.impact || 5,
        timestamp: new Date().toISOString()
      };

      await prisma.dailyEntry.update({
        where: { id: dailyEntry.id },
        data: {
          events: [...currentEvents, newEvent]
        }
      });

      return NextResponse.json({ ...newEvent, type: 'event', date: eventDate, timeline: 'past' });
    } else {
      // Crear proyecto o manifestación futura
      if (data.type === 'project') {
        const project = await prisma.project.create({
          data: {
            userId,
            name: data.title,
            description: data.description,
            category: data.category || 'personal',
            targetDate: new Date(data.date),
            impactLevel: data.impact || 5,
            energyInvested: 1.0
          }
        });

        return NextResponse.json({
          id: project.id,
          title: project.name,
          description: project.description,
          type: 'project',
          date: project.targetDate,
          timeline: 'future',
          progress: project.progress,
          category: project.category,
          impact: project.impactLevel
        });
      } else {
        const manifestation = await prisma.manifestation.create({
          data: {
            userId,
            title: data.title,
            description: data.description,
            category: data.category || 'general',
            intendedBy: new Date(data.date),
            timeframe: data.timeframe || 'medium_term',
            energyRequired: 5.0,
            impactLevel: data.impact || 5
          }
        });

        return NextResponse.json({
          id: manifestation.id,
          title: manifestation.title,
          description: manifestation.description,
          type: 'manifestation',
          date: manifestation.intendedBy,
          timeline: 'future',
          progress: manifestation.manifestationStage,
          category: manifestation.category,
          impact: manifestation.impactLevel,
          timeframe: manifestation.timeframe
        });
      }
    }
  } catch (error) {
    console.error('Error agregando evento a timeline:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
