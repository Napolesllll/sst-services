import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { emitNotificationToUser } from "@/lib/websocket/emitNotification"


export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            )
        }

        // Solo empleados pueden iniciar servicios
        if (session.user.role !== "EMPLEADO") {
            return NextResponse.json(
                { error: "No tienes permisos para iniciar servicios" },
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

        if (service.status !== "ASSIGNED") {
            return NextResponse.json(
                { error: "Este servicio no puede ser iniciado. Estado actual: " + service.status },
                { status: 400 }
            )
        }

        // Cambiar estado a IN_PROGRESS
        const updatedService = await prisma.service.update({
            where: { id: serviceId },
            data: {
                status: "IN_PROGRESS",
                startDate: new Date(),
            },
        })

        // Crear notificación para el cliente
        await prisma.notification.create({
            data: {
                userId: service.clientId,
                title: "Servicio Iniciado",
                message: `${session.user.name} ha iniciado el servicio de ${service.serviceType}`,
                type: "service_started",
                data: {
                    serviceId: service.id,
                    employeeName: session.user.name,
                },
            },
        })

        const notification = await prisma.notification.create({
            data: {
                userId: service.clientId,
                title: "Servicio Iniciado",
                message: `${session.user.name} ha iniciado el servicio de ${service.serviceType}`,
                type: "service_started",
                data: {
                    serviceId: service.id,
                    employeeName: session.user.name,
                },
            },
        })

        // 🔥 ENVIAR VÍA WEBSOCKET
        emitNotificationToUser(service.clientId, notification)

        // Registrar actividad
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "started_service",
                entity: "service",
                entityId: service.id,
                details: {
                    serviceType: service.serviceType,
                    previousStatus: "ASSIGNED",
                    newStatus: "IN_PROGRESS",
                },
            },
        })

        return NextResponse.json({
            message: "Servicio iniciado exitosamente",
            service: {
                id: updatedService.id,
                status: updatedService.status,
                startDate: updatedService.startDate,
            },
        })
    } catch (error) {
        console.error("Error starting service:", error)
        return NextResponse.json(
            { error: "Error al iniciar el servicio" },
            { status: 500 }
        )
    }
}