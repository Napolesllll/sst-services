import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "EMPLEADO") {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { serviceId, inspectionType, data, passed, observations } = body;

        // Validaciones
        if (!serviceId || !inspectionType || !data) {
            return NextResponse.json(
                { error: "Faltan campos requeridos" },
                { status: 400 }
            );
        }

        // Verificar que el servicio existe y está asignado al empleado
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) {
            return NextResponse.json(
                { error: "Servicio no encontrado" },
                { status: 404 }
            );
        }

        if (service.employeeId !== session.user.id) {
            return NextResponse.json(
                { error: "No tienes permiso para este servicio" },
                { status: 403 }
            );
        }

        // Verificar si ya existe una inspección de este tipo
        const existingInspection = await prisma.serviceInspection.findFirst({
            where: {
                serviceId,
                inspectionType,
            },
        });

        let inspection;

        if (existingInspection) {
            // Actualizar inspección existente
            inspection = await prisma.serviceInspection.update({
                where: { id: existingInspection.id },
                data: {
                    data,
                    passed,
                    observations,
                    completedAt: new Date(),
                },
            });
        } else {
            // Crear nueva inspección
            inspection = await prisma.serviceInspection.create({
                data: {
                    serviceId,
                    inspectionType,
                    data,
                    passed,
                    observations,
                    completedAt: new Date(),
                },
            });
        }

        // Registrar actividad
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: existingInspection ? "updated_inspection" : "created_inspection",
                entity: "inspection",
                entityId: inspection.id,
                details: {
                    serviceId,
                    inspectionType,
                    passed,
                },
            },
        });

        return NextResponse.json({
            success: true,
            inspection,
        });
    } catch (error: any) {
        console.error("Error creating inspection:", error);
        return NextResponse.json(
            { error: error.message || "Error al crear inspección" },
            { status: 500 }
        );
    }
}