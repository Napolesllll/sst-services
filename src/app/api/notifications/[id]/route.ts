// app/api/notifications/[id]/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/notifications/[id]
 * Obtiene una notificación específica
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            )
        }

        const { id } = await params;

        const notification = await prisma.notification.findUnique({
            where: { id },
        })

        if (!notification) {
            return NextResponse.json(
                { error: "Notificación no encontrada" },
                { status: 404 }
            )
        }

        // Verificar que la notificación pertenece al usuario
        if (notification.userId !== session.user.id) {
            return NextResponse.json(
                { error: "No tienes permiso para ver esta notificación" },
                { status: 403 }
            )
        }

        // Marcar como leída automáticamente al obtenerla
        if (!notification.read) {
            await prisma.notification.update({
                where: { id },
                data: { read: true },
            })
            notification.read = true
        }

        return NextResponse.json({
            notification,
        })
    } catch (error) {
        console.error("Error fetching notification:", error)
        return NextResponse.json(
            { error: "Error al obtener notificación" },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/notifications/[id]
 * Elimina una notificación específica
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            )
        }

        const { id } = await params;

        const notification = await prisma.notification.findUnique({
            where: { id },
        })

        if (!notification) {
            return NextResponse.json(
                { error: "Notificación no encontrada" },
                { status: 404 }
            )
        }

        // Verificar que la notificación pertenece al usuario
        if (notification.userId !== session.user.id) {
            return NextResponse.json(
                { error: "No tienes permiso para eliminar esta notificación" },
                { status: 403 }
            )
        }

        await prisma.notification.delete({
            where: { id },
        })

        return NextResponse.json({
            message: "Notificación eliminada exitosamente",
        })
    } catch (error) {
        console.error("Error deleting notification:", error)
        return NextResponse.json(
            { error: "Error al eliminar notificación" },
            { status: 500 }
        )
    }
}