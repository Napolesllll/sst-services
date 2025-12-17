import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const serviceId = id;

        const service = await prisma.service.findUnique({
            where: { id: serviceId },
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
                        email: true,
                    },
                },
                configuredBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                documents: {
                    where: {
                        isGroupDocument: false, // Solo instancias reales
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                inspections: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                evidences: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                assignments: true,
            },
        });

        if (!service) {
            return NextResponse.json(
                { error: "Servicio no encontrado" },
                { status: 404 }
            );
        }

        // Verificar permisos
        const userRole = session.user.role;
        const userId = session.user.id;

        if (
            userRole === "CLIENTE" &&
            service.clientId !== userId
        ) {
            return NextResponse.json(
                { error: "No tienes permiso para ver este servicio" },
                { status: 403 }
            );
        }

        if (
            userRole === "EMPLEADO" &&
            service.employeeId !== userId
        ) {
            return NextResponse.json(
                { error: "No tienes permiso para ver este servicio" },
                { status: 403 }
            );
        }

        return NextResponse.json({ service }, { status: 200 });
    } catch (error) {
        console.error("Error fetching service:", error);
        return NextResponse.json(
            { error: "Error al obtener el servicio" },
            { status: 500 }
        );
    }
}