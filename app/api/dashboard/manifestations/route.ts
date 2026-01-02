
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Obtener manifestaciones activas del usuario
    const manifestations = await prisma.manifestation.findMany({
      where: { 
        userId: session.user.id
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(manifestations);
  } catch (error) {
    console.error("Error obteniendo manifestaciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
