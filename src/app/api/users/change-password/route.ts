import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        // Obtener usuario actual
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        // Verificar contraseña actual
        const isValid = await bcrypt.compare(currentPassword, user.password);

        if (!isValid) {
            return NextResponse.json(
                { error: "Contraseña actual incorrecta" },
                { status: 400 }
            );
        }

        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña
        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        });

        return NextResponse.json({
            message: "Contraseña actualizada exitosamente",
        });
    } catch (error) {
        console.error("Error changing password:", error);
        return NextResponse.json(
            { error: "Error al cambiar contraseña" },
            { status: 500 }
        );
    }
}