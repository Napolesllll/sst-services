// app/api/configuration/templates/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/configuration/templates
 * Obtiene todas las plantillas de documentos
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMINISTRADOR") {
            return NextResponse.json(
                { error: "Solo administradores pueden acceder" },
                { status: 403 }
            );
        }

        const templates = await prisma.documentTemplate.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ templates }, { status: 200 });
    } catch (error) {
        console.error("Error fetching templates:", error);
        return NextResponse.json(
            { error: "Error al obtener plantillas" },
            { status: 500 }
        );
    }
}
