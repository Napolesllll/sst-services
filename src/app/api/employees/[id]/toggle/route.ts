// app/api/employees/[id]/toggle/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
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
                { error: "No tienes permisos para modificar empleados" },
                { status: 403 }
            );
        }

        const { id: employeeId } = await context.params;
        const body = await request.json();
        const { active } = body;

        if (typeof active !== "boolean") {
            return NextResponse.json(
                { error: "El estado 'active' debe ser un valor booleano" },
                { status: 400 }
            );
        }

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

        // Actualizar el estado
        const updatedEmployee = await prisma.user.update({
            where: { id: employeeId },
            data: { active },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                active: true,
                role: true,
            },
        });

        // Registrar actividad
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: active ? "activated_employee" : "deactivated_employee",
                entity: "user",
                entityId: employeeId,
                details: {
                    employeeName: updatedEmployee.name,
                    previousStatus: !active,
                    newStatus: active,
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: `Empleado ${active ? "activado" : "desactivado"} exitosamente`,
            employee: updatedEmployee,
        });
    } catch (error) {
        console.error("Error toggling employee status:", error);
        return NextResponse.json(
            { error: "Error al cambiar el estado del empleado" },
            { status: 500 }
        );
    }
}