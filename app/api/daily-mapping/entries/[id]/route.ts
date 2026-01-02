
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/daily-mapping/entries/[id] - Get single entry
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const entry = await prisma.dailyEntry.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        emotions: true,
        intentionFulfillments: {
          include: {
            intention: true,
          },
        },
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error fetching entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entry' },
      { status: 500 }
    );
  }
}

// PUT /api/daily-mapping/entries/[id] - Update entry
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const entry = await prisma.dailyEntry.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      emotionalState,
      energyLevel,
      sleepQuality,
      significantEvents,
      mainThoughts,
      observations,
      synchronicities,
    } = body;

    const updated = await prisma.dailyEntry.update({
      where: { id: params.id },
      data: {
        emotionalState: emotionalState !== undefined ? parseFloat(emotionalState) : undefined,
        energyLevel: energyLevel !== undefined ? parseFloat(energyLevel) : undefined,
        sleepQuality: sleepQuality !== undefined ? parseFloat(sleepQuality) : undefined,
        significantEvents,
        mainThoughts,
        observations,
        synchronicities,
      },
      include: {
        emotions: true,
        intentionFulfillments: {
          include: {
            intention: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/daily-mapping/entries/[id] - Delete entry
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const entry = await prisma.dailyEntry.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    await prisma.dailyEntry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}
