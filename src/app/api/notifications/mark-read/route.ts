// app/api/notifications/mark-read/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * PATCH /api/notifications/mark-read
 * Marca notificaciones como leídas
 * Body:
 * - notificationId: string (marca una específica)
 * - notificationIds: string[] (marca múltiples)
 * - markAllRead: boolean (marca todas las del usuario como leídas)
 */
export async function PATCH(request: Request) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { notificationId, notificationIds, markAllRead } = body

        // Caso 1: Marcar todas como leídas
        if (markAllRead === true) {
            const result = await prisma.notification.updateMany({
                where: {
                    userId: session.user.id,
                    read: false,
                },
                data: {
                    read: true,
                },
            })

            return NextResponse.json({
                success: true,
                message: `${result.count} notificaciones marcadas como leídas`,
                updatedCount: result.count,
            })
        }

        // Caso 2: Marcar una notificación específica
        if (notificationId) {
            // Verificar que la notificación pertenece al usuario
            const notification = await prisma.notification.findUnique({
                where: { id: notificationId },
            })

            if (!notification) {
                return NextResponse.json(
                    { error: "Notificación no encontrada" },
                    { status: 404 }
                )
            }

            if (notification.userId !== session.user.id) {
                return NextResponse.json(
                    { error: "No tienes permiso para modificar esta notificación" },
                    { status: 403 }
                )
            }

            const updated = await prisma.notification.update({
                where: { id: notificationId },
                data: { read: true },
            })

            return NextResponse.json({
                success: true,
                message: "Notificación marcada como leída",
                notification: updated,
            })
        }

        // Caso 3: Marcar múltiples notificaciones
        if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
            // Verificar que todas pertenecen al usuario
            const notifications = await prisma.notification.findMany({
                where: {
                    id: { in: notificationIds },
                    userId: session.user.id,
                },
            })

            if (notifications.length !== notificationIds.length) {
                return NextResponse.json(
                    { error: "Algunas notificaciones no te pertenecen o no existen" },
                    { status: 403 }
                )
            }

            const result = await prisma.notification.updateMany({
                where: {
                    id: { in: notificationIds },
                    userId: session.user.id,
                },
                data: {
                    read: true,
                },
            })

            return NextResponse.json({
                success: true,
                message: `${result.count} notificaciones marcadas como leídas`,
                updatedCount: result.count,
            })
        }

        // Si no se proporciona ningún parámetro válido
        return NextResponse.json(
            { error: "Debes proporcionar notificationId, notificationIds o markAllRead" },
            { status: 400 }
        )
    } catch (error) {
        console.error("Error marking notifications as read:", error)
        return NextResponse.json(
            { error: "Error al marcar notificaciones como leídas" },
            { status: 500 }
        )
    }
}

/**
 * POST /api/notifications/mark-read
 * Alternativa POST para marcar como leída (mismo comportamiento que PATCH)
 */
export async function POST(request: Request) {
    return PATCH(request)
}