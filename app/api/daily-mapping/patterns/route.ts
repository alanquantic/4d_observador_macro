
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/daily-mapping/patterns - Get detected patterns
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
    const patternType = searchParams.get('type');

    const where: any = { userId: user.id };
    if (patternType) where.patternType = patternType;

    const patterns = await prisma.pattern.findMany({
      where,
      orderBy: { lastObserved: 'desc' },
    });

    return NextResponse.json(patterns);
  } catch (error) {
    console.error('Error fetching patterns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patterns' },
      { status: 500 }
    );
  }
}

// POST /api/daily-mapping/patterns - Create/update pattern
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
      patternType,
      title,
      description,
      frequency,
      confidence,
      impact,
      supportingData,
      suggestions,
    } = body;

    const pattern = await prisma.pattern.create({
      data: {
        userId: user.id,
        patternType,
        title,
        description,
        frequency,
        confidence: confidence || 0.5,
        impact,
        supportingData,
        suggestions,
        aiGenerated: true,
      },
    });

    return NextResponse.json(pattern, { status: 201 });
  } catch (error) {
    console.error('Error creating pattern:', error);
    return NextResponse.json(
      { error: 'Failed to create pattern' },
      { status: 500 }
    );
  }
}
