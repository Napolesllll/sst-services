import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            )
        }

        // Solo empleados pueden crear documentos
        if (session.user.role !== "EMPLEADO") {
            return NextResponse.json(
                { error: "No tienes permisos para crear documentos" },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { serviceId, documentType, content } = body

        // Validaciones
        if (!serviceId || !documentType || !content) {
            return NextResponse.json(
                { error: "serviceId, documentType y content son requeridos" },
                { status: 400 }
            )
        }

        // Verificar que el servicio existe y está asignado al empleado
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
        })

        if (!service) {
            return NextResponse.json(
                { error: "Servicio no encontrado" },
                { status: 404 }
            )
        }

        if (service.employeeId !== session.user.id) {
            return NextResponse.json(
                { error: "Este servicio no está asignado a ti" },
                { status: 403 }
            )
        }

        if (service.status !== "IN_PROGRESS") {
            return NextResponse.json(
                { error: "Este servicio no está en progreso" },
                { status: 400 }
            )
        }

        // Verificar si ya existe un documento de este tipo
        const existingDoc = await prisma.serviceDocument.findFirst({
            where: {
                serviceId,
                documentType,
            },
        })

        if (existingDoc) {
            // Actualizar documento existente
            const updatedDoc = await prisma.serviceDocument.update({
                where: { id: existingDoc.id },
                data: {
                    content,
                    completedAt: new Date(),
                },
            })

            // Registrar actividad
            await prisma.activityLog.create({
                data: {
                    userId: session.user.id,
                    action: "updated_document",
                    entity: "service_document",
                    entityId: updatedDoc.id,
                    details: {
                        serviceId,
                        documentType,
                    },
                },
            })

            return NextResponse.json({
                message: "Documento actualizado exitosamente",
                document: updatedDoc,
            })
        } else {
            // Crear nuevo documento
            const newDoc = await prisma.serviceDocument.create({
                data: {
                    serviceId,
                    documentType,
                    content,
                    completedAt: new Date(),
                },
            })

            // Registrar actividad
            await prisma.activityLog.create({
                data: {
                    userId: session.user.id,
                    action: "created_document",
                    entity: "service_document",
                    entityId: newDoc.id,
                    details: {
                        serviceId,
                        documentType,
                    },
                },
            })

            return NextResponse.json({
                message: "Documento creado exitosamente",
                document: newDoc,
            }, { status: 201 })
        }
    } catch (error) {
        console.error("Error creating/updating document:", error)
        return NextResponse.json(
            { error: "Error al guardar el documento" },
            { status: 500 }
        )
    }
}