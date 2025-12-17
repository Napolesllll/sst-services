// app/api/services/documents/create/route.ts
// ACTUALIZADO para soportar sistema de instancias

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        // Solo empleados pueden crear documentos
        if (session.user.role !== "EMPLEADO") {
            return NextResponse.json(
                { error: "No tienes permisos para crear documentos" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { serviceId, documentType, content } = body;

        // Validaciones
        if (!serviceId || !documentType || !content) {
            return NextResponse.json(
                { error: "serviceId, documentType y content son requeridos" },
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
                { error: "Este servicio no está asignado a ti" },
                { status: 403 }
            );
        }

        if (service.status !== "IN_PROGRESS") {
            return NextResponse.json(
                { error: "Este servicio no está en progreso" },
                { status: 400 }
            );
        }

        // ========== SISTEMA DE INSTANCIAS ==========

        // 1. Buscar o crear el documento grupo (padre)
        let groupDocument = (await prisma.serviceDocument.findFirst({
            where: {
                serviceId,
                documentType: documentType as any,
                isGroupDocument: true,
            } as any,
            include: {
                instances: {
                    orderBy: {
                        instanceNumber: "desc",
                    } as any,
                    take: 1,
                },
            } as any,
        })) as any;

        // Si no existe documento grupo, crearlo
        if (!groupDocument) {
            groupDocument = (await prisma.serviceDocument.create({
                data: {
                    serviceId,
                    documentType: documentType as any,
                    content: {},
                    isGroupDocument: true,
                } as any,
                include: {
                    instances: true,
                } as any,
            })) as any;
        }

        // 2. Calcular el número de la siguiente instancia
        const lastInstanceNumber =
            groupDocument.instances.length > 0
                ? groupDocument.instances[0].instanceNumber || 0
                : 0;

        const newInstanceNumber = lastInstanceNumber + 1;

        // 3. Crear la nueva instancia
        const newInstance = await prisma.serviceDocument.create({
            data: {
                serviceId,
                documentType: documentType as any,
                content,
                completedAt: new Date(),
                parentDocumentId: groupDocument.id,
                instanceNumber: newInstanceNumber,
                isGroupDocument: false,
            } as any,
        });

        // 4. Actualizar el documento grupo con la fecha de la última instancia
        await prisma.serviceDocument.update({
            where: { id: groupDocument.id },
            data: {
                completedAt: new Date(),
                updatedAt: new Date(),
            },
        });

        // 5. Registrar actividad
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "created_document_instance",
                entity: "service_document",
                entityId: newInstance.id,
                details: {
                    serviceId,
                    documentType,
                    instanceNumber: newInstanceNumber,
                    groupDocumentId: groupDocument.id,
                },
            },
        });

        return NextResponse.json(
            {
                message: `Registro #${newInstanceNumber} creado exitosamente`,
                instance: newInstance,
                groupDocumentId: groupDocument.id,
                instanceNumber: newInstanceNumber,
                totalInstances: lastInstanceNumber + 1,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating document instance:", error);
        return NextResponse.json(
            { error: "Error al guardar el documento" },
            { status: 500 }
        );
    }
}