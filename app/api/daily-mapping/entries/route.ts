
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/daily-mapping/entries - Get all entries for user
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '30');

    const where: any = { userId: user.id };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const entries = await prisma.dailyEntry.findMany({
      where,
      include: {
        emotions: true,
        intentionFulfillments: {
          include: {
            intention: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

// POST /api/daily-mapping/entries - Create new entry
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

    const body = await request.json();
    const {
      date,
      emotionalState,
      energyLevel,
      sleepQuality,
      significantEvents,
      mainThoughts,
      observations,
      synchronicities,
      emotions,
      intentionIds,
    } = body;

    // Create entry
    const entry = await prisma.dailyEntry.create({
      data: {
        userId: user.id,
        date: date ? new Date(date) : new Date(),
        emotionalState: parseFloat(emotionalState),
        energyLevel: parseFloat(energyLevel),
        sleepQuality: sleepQuality ? parseFloat(sleepQuality) : null,
        significantEvents,
        mainThoughts,
        observations,
        synchronicities,
      },
    });

    // Add emotions if provided
    if (emotions && Array.isArray(emotions)) {
      await Promise.all(
        emotions.map((emotion: any) =>
          prisma.emotion.create({
            data: {
              entryId: entry.id,
              emotionType: emotion.type,
              intensity: parseFloat(emotion.intensity),
              notes: emotion.notes,
            },
          })
        )
      );
    }

    // Link fulfilled intentions if provided
    if (intentionIds && Array.isArray(intentionIds)) {
      await Promise.all(
        intentionIds.map((intentionId: string) =>
          prisma.intentionFulfillment.create({
            data: {
              intentionId,
              entryId: entry.id,
              fulfilled: true,
            },
          })
        )
      );

      // Update intention streaks
      for (const intentionId of intentionIds) {
        const intention = await prisma.intention.findUnique({
          where: { id: intentionId },
        });

        if (intention) {
          const newTotalFulfilled = intention.totalFulfilledDays + 1;
          const newStreak = intention.currentStreak + 1;
          const newLongest = Math.max(newStreak, intention.longestStreak);

          await prisma.intention.update({
            where: { id: intentionId },
            data: {
              totalFulfilledDays: newTotalFulfilled,
              currentStreak: newStreak,
              longestStreak: newLongest,
            },
          });
        }
      }
    }

    // Fetch complete entry with relations
    const completeEntry = await prisma.dailyEntry.findUnique({
      where: { id: entry.id },
      include: {
        emotions: true,
        intentionFulfillments: {
          include: {
            intention: true,
          },
        },
      },
    });

    return NextResponse.json(completeEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}
