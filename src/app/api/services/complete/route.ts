import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { emitNotificationToUser, emitNotificationToAdmins } from "@/lib/websocket/emitNotification"

export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            )
        }

        // Solo empleados pueden completar servicios
        if (session.user.role !== "EMPLEADO") {
            return NextResponse.json(
                { error: "No tienes permisos para completar servicios" },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { serviceId } = body

        if (!serviceId) {
            return NextResponse.json(
                { error: "serviceId es requerido" },
                { status: 400 }
            )
        }

        // Verificar que el servicio existe y está asignado al empleado
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: {
                client: true,
                documents: true,
                inspections: true,
            },
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
                { error: "Este servicio no puede ser completado. Estado actual: " + service.status },
                { status: 400 }
            )
        }

        // Cambiar estado a COMPLETED
        const updatedService = await prisma.service.update({
            where: { id: serviceId },
            data: {
                status: "COMPLETED",
                endDate: new Date(),
                completedAt: new Date(),
            },
        })

        // ✅ NOTIFICACIÓN AL CLIENTE
        const clientNotification = await prisma.notification.create({
            data: {
                userId: service.clientId,
                title: "Servicio Completado",
                message: `${session.user.name} ha completado el servicio de ${service.serviceType}. Ya puedes descargar el informe final.`,
                type: "service_completed",
                data: {
                    serviceId: service.id,
                    employeeName: session.user.name,
                },
            },
        })

        // 🔥 ENVIAR AL CLIENTE VÍA WEBSOCKET
        emitNotificationToUser(service.clientId, clientNotification)

        // ✅ OBTENER ADMINISTRADORES
        const admins = await prisma.user.findMany({
            where: {
                role: "ADMINISTRADOR",
                active: true,
            },
            select: {
                id: true,
            },
        })

        // ✅ NOTIFICACIONES A ADMINISTRADORES
        if (admins.length > 0) {
            const adminNotifications = await Promise.all(
                admins.map((admin) =>
                    prisma.notification.create({
                        data: {
                            userId: admin.id,
                            title: "Servicio Completado",
                            message: `${session.user.name} completó el servicio para ${service.client.name}`,
                            type: "service_completed_admin",
                            data: {
                                serviceId: service.id,
                                employeeName: session.user.name,
                                clientName: service.client.name,
                            },
                        },
                    })
                )
            )

            // 🔥 ENVIAR A CADA ADMIN VÍA WEBSOCKET
            adminNotifications.forEach((notification) => {
                emitNotificationToAdmins(notification)
            })
        }

        // ✅ REGISTRAR ACTIVIDAD
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "completed_service",
                entity: "service",
                entityId: service.id,
                details: {
                    serviceType: service.serviceType,
                    previousStatus: "IN_PROGRESS",
                    newStatus: "COMPLETED",
                    documentsCount: service.documents.length,
                    inspectionsCount: service.inspections.length,
                },
            },
        })

        return NextResponse.json({
            message: "Servicio completado exitosamente",
            service: {
                id: updatedService.id,
                status: updatedService.status,
                completedAt: updatedService.completedAt,
            },
        })
    } catch (error) {
        console.error("Error completing service:", error)
        return NextResponse.json(
            { error: "Error al completar el servicio" },
            { status: 500 }
        )
    }
}