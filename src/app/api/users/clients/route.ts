// app/api/users/clients/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        // Solo administradores pueden ver la lista de clientes
        if (session.user.role !== "ADMINISTRADOR") {
            return NextResponse.json(
                { error: "No tienes permisos para ver clientes" },
                { status: 403 }
            );
        }

        // Obtener todos los clientes
        const clients = await prisma.user.findMany({
            where: {
                role: "CLIENTE",
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                active: true,
                createdAt: true,
                _count: {
                    select: {
                        servicesRequested: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({
            clients,
            total: clients.length,
        });
    } catch (error) {
        console.error("Error fetching clients:", error);
        return NextResponse.json(
            { error: "Error al obtener clientes" },
            { status: 500 }
        );
    }
}