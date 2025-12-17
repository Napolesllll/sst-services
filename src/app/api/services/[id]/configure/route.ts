// app/api/services/[id]/configure/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/services/[id]/configure
 * Configura documentos e inspecciones requeridas para un servicio específico
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMINISTRADOR") {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { requiredDocs, requiredInspections, notes } = body;

        // Validar entrada
        if (
            !Array.isArray(requiredDocs) ||
            !Array.isArray(requiredInspections)
        ) {
            return NextResponse.json(
                { error: "requiredDocs e requiredInspections deben ser arrays" },
                { status: 400 }
            );
        }

        // Verificar que el servicio existe
        const service = await prisma.service.findUnique({
            where: { id },
        });

        if (!service) {
            return NextResponse.json(
                { error: "Servicio no encontrado" },
                { status: 404 }
            );
        }

        // Actualizar el servicio con la configuración
        const updateData: any = {
            observations: notes ? `${service.observations || ""}\n[CONFIG] ${notes}` : service.observations,
            configuredAt: new Date(),
            configuredById: session.user.id,
        };

        // Agregar arrays de documentos e inspecciones
        if (Array.isArray(requiredDocs)) {
            updateData.requiredDocs = requiredDocs;
        }
        if (Array.isArray(requiredInspections)) {
            updateData.requiredInspections = requiredInspections;
        }

        const updatedService = await prisma.service.update({
            where: { id },
            data: updateData,
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Registrar actividad
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "configured_service",
                entity: "service",
                entityId: id,
                details: {
                    requiredDocs,
                    requiredInspections,
                    notes,
                },
            },
        });

        return NextResponse.json({
            message: "Servicio configurado exitosamente",
            service: updatedService,
        });
    } catch (error) {
        console.error("Error configuring service:", error);
        return NextResponse.json(
            { error: "Error al configurar servicio" },
            { status: 500 }
        );
    }
}
