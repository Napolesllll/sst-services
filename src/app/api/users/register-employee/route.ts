// app/api/users/register-employee/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
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
                { error: "No tienes permisos para registrar empleados" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, email, phone, password } = body;

        // Validaciones
        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: "El nombre es requerido" },
                { status: 400 }
            );
        }

        if (!email || !email.trim()) {
            return NextResponse.json(
                { error: "El correo electrónico es requerido" },
                { status: 400 }
            );
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "El formato del correo electrónico no es válido" },
                { status: 400 }
            );
        }

        if (!phone || !phone.trim()) {
            return NextResponse.json(
                { error: "El teléfono es requerido" },
                { status: 400 }
            );
        }

        if (!password || password.length < 6) {
            return NextResponse.json(
                { error: "La contraseña debe tener al menos 6 caracteres" },
                { status: 400 }
            );
        }

        // Verificar si el email ya existe
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Este correo electrónico ya está registrado" },
                { status: 400 }
            );
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el empleado
        const employee = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                phone: phone.trim(),
                password: hashedPassword,
                role: "EMPLEADO",
                active: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                active: true,
                createdAt: true,
            },
        });

        // Registrar actividad
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "created_employee",
                entity: "user",
                entityId: employee.id,
                details: {
                    employeeName: employee.name,
                    employeeEmail: employee.email,
                },
            },
        });

        return NextResponse.json(
            {
                message: "Empleado registrado exitosamente",
                employee,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error registering employee:", error);
        return NextResponse.json(
            { error: "Error al registrar empleado. Por favor intenta de nuevo." },
            { status: 500 }
        );
    }
}