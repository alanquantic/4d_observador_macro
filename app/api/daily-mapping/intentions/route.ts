
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/daily-mapping/intentions - Get all intentions
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
    const status = searchParams.get('status');
    const frequency = searchParams.get('frequency');

    const where: any = { userId: user.id };
    if (status) where.status = status;
    if (frequency) where.frequency = frequency;

    const intentions = await prisma.intention.findMany({
      where,
      include: {
        fulfillments: {
          orderBy: { createdAt: 'desc' },
          take: 7,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(intentions);
  } catch (error) {
    console.error('Error fetching intentions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch intentions' },
      { status: 500 }
    );
  }
}

// POST /api/daily-mapping/intentions - Create new intention
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
      title,
      description,
      category,
      frequency,
      startDate,
      endDate,
      notes,
    } = body;

    const intention = await prisma.intention.create({
      data: {
        userId: user.id,
        title,
        description,
        category,
        frequency: frequency || 'daily',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        notes,
      },
    });

    return NextResponse.json(intention, { status: 201 });
  } catch (error) {
    console.error('Error creating intention:', error);
    return NextResponse.json(
      { error: 'Failed to create intention' },
      { status: 500 }
    );
  }
}
