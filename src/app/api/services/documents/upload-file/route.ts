// app/api/services/documents/upload-file/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { processWordFile } from "@/lib/wordProcessor";

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
        const isTemplate = formData.get("isTemplate") === "true"; // Flag para guardar como template

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
        const fileName = isTemplate
            ? `template_${documentType}${ext}`
            : `${documentType}_${instanceId}_${timestamp}${ext}`;
        const filePath = join(uploadsDir, fileName);

        // Guardar archivo
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/documents/${fileName}`;

        // Si es plantilla, guardarla en la base de datos
        if (isTemplate) {
            // Eliminar plantilla anterior si existe
            await prisma.documentTemplate.deleteMany({
                where: { documentType: documentType as any },
            });

            // Crear nueva plantilla
            await prisma.documentTemplate.create({
                data: {
                    documentType: documentType as any,
                    templatePath: filePath,
                    templateName: file.name,
                    uploadedBy: session.user.id,
                },
            });

            return NextResponse.json({
                message: "Plantilla guardada exitosamente",
                fileUrl,
                fileName,
                isTemplate: true,
            });
        }

        // Si no es plantilla, procesar y actualizar documento
        let extractedData = {};
        if (
            file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.type === "application/msword"
        ) {
            try {
                extractedData = await processWordFile(buffer, documentType);
            } catch (error) {
                console.error("Error processing Word file:", error);
            }
        }

        const updateData: any = {
            fileUrl,
            updatedAt: new Date(),
        };

        if (Object.keys(extractedData).length > 0) {
            const currentDoc = await prisma.serviceDocument.findUnique({
                where: { id: instanceId },
                select: { content: true },
            });
            updateData.content = {
                ...(currentDoc?.content as any || {}),
                ...extractedData,
            };
        }

        await prisma.serviceDocument.update({
            where: { id: instanceId },
            data: updateData,
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
            extractedData: Object.keys(extractedData).length > 0 ? extractedData : null,
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Error al subir archivo" },
            { status: 500 }
        );
    }
}
