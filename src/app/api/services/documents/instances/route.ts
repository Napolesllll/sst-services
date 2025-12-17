// app/api/services/documents/instances/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DocumentType } from "@prisma/client";

/**
 * GET /api/services/documents/instances?serviceId=xxx&documentType=CHARLA_SEGURIDAD
 * Obtiene todas las instancias de un tipo de documento para un servicio
 */
export async function GET(request: Request) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const serviceId = searchParams.get("serviceId");
        const documentType = searchParams.get("documentType");

        if (!serviceId || !documentType) {
            return NextResponse.json(
                { error: "serviceId y documentType son requeridos" },
                { status: 400 }
            );
        }

        // Validar que documentType sea válido
        if (!Object.values(DocumentType).includes(documentType as DocumentType)) {
            return NextResponse.json(
                { error: "Tipo de documento inválido" },
                { status: 400 }
            );
        }

        // Verificar acceso al servicio
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) {
            return NextResponse.json(
                { error: "Servicio no encontrado" },
                { status: 404 }
            );
        }

        // Solo el empleado asignado, el cliente o admin pueden ver los documentos
        if (
            session.user.role !== "ADMINISTRADOR" &&
            service.employeeId !== session.user.id &&
            service.clientId !== session.user.id
        ) {
            return NextResponse.json(
                { error: "No tienes acceso a este servicio" },
                { status: 403 }
            );
        }

        // Buscar el documento grupo (padre)
        const groupDocumentRaw = await prisma.serviceDocument.findFirst({
            where: {
                serviceId,
                documentType: documentType as DocumentType,
                isGroupDocument: true,
            } as any,
        });
        const groupDocument = groupDocumentRaw as any;

        // Si no existe documento grupo, crearlo
        let groupDocId = groupDocument?.id;
        if (!groupDocument) {
            const newGroup = await prisma.serviceDocument.create({
                data: {
                    serviceId,
                    documentType: documentType as DocumentType,
                    content: {},
                    isGroupDocument: true,
                } as any,
            });
            groupDocId = newGroup.id;
        }

        // Obtener todas las instancias
        const instances = (await prisma.serviceDocument.findMany({
            where: {
                parentDocumentId: groupDocId,
                isGroupDocument: false,
            } as any,
            orderBy: {
                instanceNumber: "desc",
            } as any,
        })) as any[];

        return NextResponse.json({
            groupDocumentId: groupDocId,
            instances: instances.map((inst) => ({
                id: inst.id,
                instanceNumber: inst.instanceNumber,
                completedAt: inst.completedAt?.toISOString() || null,
                content: inst.content,
                createdAt: inst.createdAt.toISOString(),
            })),
            totalInstances: instances.length,
        });
    } catch (error) {
        console.error("Error fetching document instances:", error);
        return NextResponse.json(
            { error: "Error al obtener instancias" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/services/documents/instances?instanceId=xxx
 * Elimina una instancia específica
 */
export async function DELETE(request: Request) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        // Solo empleados pueden eliminar
        if (session.user.role !== "EMPLEADO") {
            return NextResponse.json(
                { error: "No tienes permisos para eliminar documentos" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const instanceId = searchParams.get("instanceId");

        if (!instanceId) {
            return NextResponse.json(
                { error: "instanceId es requerido" },
                { status: 400 }
            );
        }

        // Buscar la instancia
        const instanceRaw = await prisma.serviceDocument.findUnique({
            where: { id: instanceId },
            include: {
                service: true,
            },
        });
        const instance = instanceRaw as any;

        if (!instance) {
            return NextResponse.json(
                { error: "Instancia no encontrada" },
                { status: 404 }
            );
        }

        // Verificar que sea el empleado asignado
        if (instance.service.employeeId !== session.user.id) {
            return NextResponse.json(
                { error: "Solo el empleado asignado puede eliminar esta instancia" },
                { status: 403 }
            );
        }

        // No permitir eliminar si es un documento grupo
        if (instance.isGroupDocument) {
            return NextResponse.json(
                { error: "No se puede eliminar el documento principal" },
                { status: 400 }
            );
        }

        // Eliminar la instancia
        await prisma.serviceDocument.delete({
            where: { id: instanceId },
        });

        // Registrar actividad
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "deleted_document_instance",
                entity: "service_document",
                entityId: instanceId,
                details: {
                    serviceId: instance.serviceId,
                    documentType: instance.documentType,
                    instanceNumber: instance.instanceNumber,
                },
            },
        });

        return NextResponse.json({
            message: "Instancia eliminada exitosamente",
        });
    } catch (error) {
        console.error("Error deleting document instance:", error);
        return NextResponse.json(
            { error: "Error al eliminar instancia" },
            { status: 500 }
        );
    }
}