import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
        const status = searchParams.get("status")

        let whereClause: any = {}

        if (session.user.role === "CLIENTE") {
            whereClause.clientId = session.user.id
        } else if (session.user.role === "EMPLEADO") {
            whereClause.employeeId = session.user.id
        } else if (session.user.role === "ADMINISTRADOR") {
            whereClause = {}
        } else {
            return NextResponse.json(
                { error: "Rol no autorizado" },
                { status: 403 }
            )
        }

        if (status) {
            whereClause.status = status
        }

        const services = await prisma.service.findMany({
            where: whereClause,
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        const stats = await prisma.service.groupBy({
            by: ["status"],
            where: whereClause,
            _count: {
                status: true,
            },
        })

        const statsFormatted = stats.reduce((acc, curr) => {
            acc[curr.status] = curr._count.status
            return acc
        }, {} as Record<string, number>)

        return NextResponse.json({
            services,
            stats: {
                pending: statsFormatted.PENDING || 0,
                assigned: statsFormatted.ASSIGNED || 0,
                inProgress: statsFormatted.IN_PROGRESS || 0,
                completed: statsFormatted.COMPLETED || 0,
                cancelled: statsFormatted.CANCELLED || 0,
                postponed: statsFormatted.POSTPONED || 0,
                reopened: statsFormatted.REOPENED || 0,
                total: services.length,
            },
        })
    } catch (error) {
        console.error("Error fetching services:", error)
        return NextResponse.json(
            { error: "Error al obtener los servicios" },
            { status: 500 }
        )
    }
}
