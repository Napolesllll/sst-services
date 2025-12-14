// app/api/employees/all/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        // Verificar autenticación
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        // Solo administradores pueden ver la lista de empleados
        if (session.user.role !== "ADMINISTRADOR") {
            return NextResponse.json(
                { error: "No tienes permisos para ver empleados" },
                { status: 403 }
            );
        }

        // Obtener TODOS los empleados (activos e inactivos)
        const employees = await prisma.user.findMany({
            where: {
                role: "EMPLEADO",
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
                        servicesAssigned: true,
                    },
                },
            },
            orderBy: [
                { active: "desc" }, // Activos primero
                { name: "asc" },    // Luego por nombre
            ],
        });

        // Contar activos e inactivos
        const activeCount = employees.filter((e) => e.active).length;
        const inactiveCount = employees.filter((e) => !e.active).length;

        return NextResponse.json({
            employees,
            total: employees.length,
            activeCount,
            inactiveCount,
        });
    } catch (error) {
        console.error("Error fetching employees:", error);
        return NextResponse.json(
            { error: "Error al obtener empleados" },
            { status: 500 }
        );
    }
}