// 📁 app/api/users/profile/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        const body = await request.json();
        const { name, phone } = body;

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                phone,
            },
        });

        return NextResponse.json({
            message: "Perfil actualizado exitosamente",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
            },
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Error al actualizar perfil" },
            { status: 500 }
        );
    }
}