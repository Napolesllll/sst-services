// app/api/services/documents/upload-file/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const instanceId = formData.get("instanceId") as string;
        const documentType = formData.get("documentType") as string;

        if (!file || !instanceId || !documentType) {
            return NextResponse.json(
                { error: "Datos incompletos" },
                { status: 400 }
            );
        }

        // Validar tipo de archivo
        const allowedTypes = [
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/pdf",
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Solo se permiten archivos .doc, .docx o .pdf" },
                { status: 400 }
            );
        }

        // Validar tamaño (máx 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: "El archivo no debe exceder 10MB" },
                { status: 400 }
            );
        }

        // Crear carpeta de uploads si no existe
        const uploadsDir = join(process.cwd(), "public", "uploads", "documents");
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const ext = file.name.substring(file.name.lastIndexOf("."));
        const fileName = `${documentType}_${instanceId}_${timestamp}${ext}`;
        const filePath = join(uploadsDir, fileName);

        // Guardar archivo
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Guardar referencia en base de datos
        const fileUrl = `/uploads/documents/${fileName}`;

        // Actualizar el documento con la URL del archivo
        await prisma.serviceDocument.update({
            where: { id: instanceId },
            data: {
                fileUrl,
                updatedAt: new Date(),
            },
        });

        // Registrar actividad
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "uploaded_document_file",
                entity: "service_document",
                entityId: instanceId,
                details: {
                    documentType,
                    fileName,
                    fileSize: file.size,
                },
            },
        });

        return NextResponse.json({
            message: "Archivo subido exitosamente",
            fileUrl,
            fileName,
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Error al subir archivo" },
            { status: 500 }
        );
    }
}
