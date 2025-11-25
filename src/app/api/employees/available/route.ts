import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    try {
        // Verificar autenticación
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            )
        }

        // Solo administradores pueden ver la lista de empleados
        if (session.user.role !== "ADMINISTRADOR") {
            return NextResponse.json(
                { error: "No tienes permisos para ver empleados" },
                { status: 403 }
            )
        }

        // Obtener todos los empleados activos
        const employees = await prisma.user.findMany({
            where: {
                role: "EMPLEADO",
                active: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
            },
            orderBy: {
                name: "asc",
            },
        })

        return NextResponse.json({
            employees,
            total: employees.length,
        })
    } catch (error) {
        console.error("Error fetching employees:", error)
        return NextResponse.json(
            { error: "Error al obtener empleados" },
            { status: 500 }
        )
    }
}