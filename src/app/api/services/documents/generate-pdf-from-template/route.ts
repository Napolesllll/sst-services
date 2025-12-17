// app/api/services/documents/generate-pdf-from-template/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import jsPDF from "jspdf";
import { existsSync } from "fs";

/**
 * POST /api/services/documents/generate-pdf-from-template
 * Genera un PDF consolidado con todas las instancias del documento
 * usando la plantilla como formato base
 */
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        const body = await request.json();
        const { groupDocumentId, documentType, documentLabel } = body;

        if (!groupDocumentId || !documentType) {
            return NextResponse.json(
                { error: "Datos incompletos" },
                { status: 400 }
            );
        }

        // Obtener todas las instancias del documento grupo
        const instances = await prisma.serviceDocument.findMany({
            where: {
                parentDocumentId: groupDocumentId,
                isGroupDocument: false,
            },
            orderBy: {
                instanceNumber: "asc",
            },
        });

        if (instances.length === 0) {
            return NextResponse.json(
                { error: "No hay instancias para este documento" },
                { status: 400 }
            );
        }

        // Buscar la plantilla
        const template = await prisma.documentTemplate.findUnique({
            where: { documentType: documentType as any },
        });

        // Generar PDF consolidado
        const pdfBuffer = generateConsolidatedPDF(
            documentType,
            instances,
            documentLabel,
            template?.templatePath || null
        );

        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${documentLabel}_CONSOLIDADO_${new Date().toISOString().split("T")[0]}.pdf"`,
            },
        });
    } catch (error) {
        console.error("Error generating PDF:", error);
        return NextResponse.json(
            { error: "Error al generar PDF" },
            { status: 500 }
        );
    }
}

function generateConsolidatedPDF(
    documentType: string,
    instances: any[],
    documentLabel: string,
    templatePath: string | null
): Buffer {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;
    let pageCount = 1;

    // Función helper para agregar texto
    const addText = (text: string, size: number = 10, bold: boolean = false, color: number[] = [0, 0, 0]) => {
        pdf.setTextColor(color[0] || 0, color[1] || 0, color[2] || 0);
        pdf.setFontSize(size);
        pdf.setFont("helvetica", bold ? "bold" : "normal");

        const maxWidth = pageWidth - 2 * margin;
        const lines = pdf.splitTextToSize(text, maxWidth);

        lines.forEach((line: string, index: number) => {
            if (yPos > pageHeight - margin - 5) {
                pdf.addPage();
                yPos = margin;
                pageCount++;
            }
            pdf.text(line, margin, yPos);
            yPos += 6;
        });
    };

    const addSectionTitle = (title: string) => {
        if (yPos > pageHeight - margin - 15) {
            pdf.addPage();
            yPos = margin;
            pageCount++;
        }
        yPos += 5;
        pdf.setFillColor(33, 150, 243);
        pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text(title, margin + 3, yPos);
        yPos += 10;
        pdf.setTextColor(0, 0, 0);
    };

    const addPageBreak = () => {
        pdf.addPage();
        yPos = margin;
        pageCount++;
    };

    // HEADER
    pdf.setFillColor(33, 150, 243);
    pdf.rect(0, 0, pageWidth, 30, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(documentLabel, pageWidth / 2, 20, { align: "center" });

    yPos = 45;
    pdf.setTextColor(0, 0, 0);

    // INFO GENERAL
    addText(
        `Documento Consolidado - ${instances.length} registro(s)`,
        9,
        true,
        [100, 100, 100]
    );
    yPos += 5;
    addText(
        `Generado: ${new Date().toLocaleString("es-CO")}`,
        8,
        false,
        [100, 100, 100]
    );
    yPos += 10;

    // AGREGAR CADA INSTANCIA
    instances.forEach((instance, index) => {
        // Título de la instancia
        addSectionTitle(
            `REGISTRO #${instance.instanceNumber} - ${new Date(instance.completedAt).toLocaleDateString("es-CO")}`
        );

        // Contenido de la instancia
        if (instance.content) {
            const content = instance.content;

            // Mostrar cada campo
            Object.entries(content).forEach(([key, value]) => {
                if (value) {
                    if (typeof value === "string" || typeof value === "number") {
                        // Texto simple
                        const displayKey = key
                            .replace(/_/g, " ")
                            .toUpperCase();
                        addText(`${displayKey}: ${value}`, 9, false, [30, 30, 30]);
                        yPos += 2;
                    } else if (Array.isArray(value)) {
                        // Arrays de datos
                        const displayKey = key
                            .replace(/_/g, " ")
                            .toUpperCase();
                        addText(`${displayKey}:`, 9, true, [50, 50, 50]);
                        yPos += 2;
                        value.forEach((item: any) => {
                            addText(
                                `  • ${item}`,
                                8,
                                false,
                                [60, 60, 60]
                            );
                            yPos += 3;
                        });
                        yPos += 2;
                    }
                }
            });
        } else {
            addText("Sin información", 9, false, [150, 150, 150]);
        }

        yPos += 8;

        // Agregar salto de página entre instancias (excepto la última)
        if (index < instances.length - 1) {
            addPageBreak();
        }
    });

    // FOOTER EN TODAS LAS PÁGINAS
    const totalPages = (pdf as any).internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
            `Página ${i} de ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
        );
        pdf.text(
            `${documentLabel} | Consolidado`,
            margin,
            pageHeight - 10,
            { align: "left" }
        );
        pdf.text(
            new Date().toLocaleDateString("es-CO"),
            pageWidth - margin,
            pageHeight - 10,
            { align: "right" }
        );
    }

    return Buffer.from(pdf.output("arraybuffer"));
}
