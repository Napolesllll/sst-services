// app/api/employees/[id]/stats/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        // Verificar autenticación
        if (!session || !session.user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        // Verificar que sea administrador
        if (session.user.role !== "ADMINISTRADOR") {
            return NextResponse.json(
                { error: "No tienes permisos para ver estadísticas de empleados" },
                { status: 403 }
            );
        }

        const { id: employeeId } = await context.params;

        // Verificar que el empleado existe
        const employee = await prisma.user.findUnique({
            where: { id: employeeId },
        });

        if (!employee) {
            return NextResponse.json(
                { error: "Empleado no encontrado" },
                { status: 404 }
            );
        }

        // Verificar que sea realmente un empleado
        if (employee.role !== "EMPLEADO") {
            return NextResponse.json(
                { error: "Este usuario no es un empleado" },
                { status: 400 }
            );
        }

        // Obtener estadísticas de servicios
        const services = await prisma.service.findMany({
            where: {
                employeeId: employeeId,
            },
            select: {
                id: true,
                status: true,
                serviceType: true,
                createdAt: true,
                completedAt: true,
            },
        });

        // Calcular estadísticas
        const totalServices = services.length;
        const inProgressServices = services.filter(
            (s) => s.status === "IN_PROGRESS" || s.status === "ASSIGNED"
        ).length;
        const completedServices = services.filter(
            (s) => s.status === "COMPLETED"
        ).length;

        // Servicios por tipo
        const servicesByType: { [key: string]: number } = {};
        services.forEach((service) => {
            servicesByType[service.serviceType] =
                (servicesByType[service.serviceType] || 0) + 1;
        });

        // Servicios completados este mes
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const completedThisMonth = services.filter(
            (s) =>
                s.status === "COMPLETED" &&
                s.completedAt &&
                new Date(s.completedAt) >= startOfMonth
        ).length;

        return NextResponse.json({
            success: true,
            stats: {
                totalServices,
                inProgressServices,
                completedServices,
                completedThisMonth,
                servicesByType,
            },
            employee: {
                id: employee.id,
                name: employee.name,
                email: employee.email,
                phone: employee.phone,
                active: employee.active,
            },
        });
    } catch (error) {
        console.error("Error fetching employee stats:", error);
        return NextResponse.json(
            { error: "Error al obtener estadísticas del empleado" },
            { status: 500 }
        );
    }
}