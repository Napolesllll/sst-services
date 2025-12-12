// app/api/notifications/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/notifications
 * Obtiene todas las notificaciones del usuario autenticado
 * Query params opcionales:
 * - limit: número máximo de notificaciones (default: 50)
 * - unreadOnly: solo notificaciones no leídas (true/false)
 */
export async function GET(request: Request) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get("limit") || "50")
        const unreadOnly = searchParams.get("unreadOnly") === "true"

        // Construir filtros
        const where: any = {
            userId: session.user.id,
        }

        if (unreadOnly) {
            where.read = false
        }

        // Obtener notificaciones
        const notifications = await prisma.notification.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            take: limit,
        })

        // Contar no leídas
        const unreadCount = await prisma.notification.count({
            where: {
                userId: session.user.id,
                read: false,
            },
        })

        // Contar total
        const totalCount = await prisma.notification.count({
            where: {
                userId: session.user.id,
            },
        })

        return NextResponse.json({
            notifications,
            unreadCount,
            totalCount,
            hasMore: totalCount > limit,
        })
    } catch (error) {
        console.error("Error fetching notifications:", error)
        return NextResponse.json(
            { error: "Error al obtener notificaciones" },
            { status: 500 }
        )
    }
}

/**
 * POST /api/notifications
 * Crea una nueva notificación (solo para admins o sistema)
 */
export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            )
        }

        // Solo administradores pueden crear notificaciones manualmente
        if (session.user.role !== "ADMINISTRADOR") {
            return NextResponse.json(
                { error: "No tienes permisos para crear notificaciones" },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { userId, title, message, type, data } = body

        // Validaciones
        if (!userId || !title || !message || !type) {
            return NextResponse.json(
                { error: "userId, title, message y type son requeridos" },
                { status: 400 }
            )
        }

        // Verificar que el usuario existe
        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            return NextResponse.json(
                { error: "Usuario no encontrado" },
                { status: 404 }
            )
        }

        // Crear notificación
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                data: data || {},
            },
        })

        // Registrar actividad
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "created_notification",
                entity: "notification",
                entityId: notification.id,
                details: {
                    targetUserId: userId,
                    type,
                },
            },
        })

        return NextResponse.json(
            {
                message: "Notificación creada exitosamente",
                notification,
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Error creating notification:", error)
        return NextResponse.json(
            { error: "Error al crear notificación" },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/notifications
 * Elimina todas las notificaciones leídas del usuario
 */
export async function DELETE(request: Request) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const deleteAll = searchParams.get("all") === "true"

        let where: any = {
            userId: session.user.id,
        }

        // Si no es deleteAll, solo eliminar las leídas
        if (!deleteAll) {
            where.read = true
        }

        const result = await prisma.notification.deleteMany({
            where,
        })

        return NextResponse.json({
            message: `${result.count} notificaciones eliminadas`,
            deletedCount: result.count,
        })
    } catch (error) {
        console.error("Error deleting notifications:", error)
        return NextResponse.json(
            { error: "Error al eliminar notificaciones" },
            { status: 500 }
        )
    }
}