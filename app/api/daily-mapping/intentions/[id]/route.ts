
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// PUT /api/daily-mapping/intentions/[id] - Update intention
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

    const intention = await prisma.intention.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!intention) {
      return NextResponse.json({ error: 'Intention not found' }, { status: 404 });
    }

    const body = await request.json();
    
    const updated = await prisma.intention.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating intention:', error);
    return NextResponse.json(
      { error: 'Failed to update intention' },
      { status: 500 }
    );
  }
}

// DELETE /api/daily-mapping/intentions/[id] - Delete intention
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

    const intention = await prisma.intention.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!intention) {
      return NextResponse.json({ error: 'Intention not found' }, { status: 404 });
    }

    await prisma.intention.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting intention:', error);
    return NextResponse.json(
      { error: 'Failed to delete intention' },
      { status: 500 }
    );
  }
}
