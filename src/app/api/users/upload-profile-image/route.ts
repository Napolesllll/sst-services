import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó archivo" },
        { status: 400 }
      );
    }

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen" },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen no debe exceder 5MB" },
        { status: 400 }
      );
    }

    // Crear directorio si no existe
    const uploadDir = join(process.cwd(), "public/uploads/profiles");
    await mkdir(uploadDir, { recursive: true });

    // Generar nombre único para el archivo
    const fileName = `${session.user.id}-${randomBytes(8).toString("hex")}.${file.type.split("/")[1]}`;
    const filePath = join(uploadDir, fileName);

    // Convertir archivo a buffer y guardar
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Actualizar URL de perfil en la base de datos
    const imageUrl = `/uploads/profiles/${fileName}`;
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileImage: imageUrl },
    });

    return NextResponse.json({
      success: true,
      profileImage: imageUrl,
      message: "Foto de perfil actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al subir imagen:", error);
    return NextResponse.json(
      { error: "Error al subir la imagen" },
      { status: 500 }
    );
  }
}
