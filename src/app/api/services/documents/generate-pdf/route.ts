// app/api/services/documents/generate-pdf/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import jsPDF from "jspdf";

const documentTitles: { [key: string]: string } = {
    CHARLA_SEGURIDAD: "CHARLA DE SEGURIDAD",
    ATS: "ANÁLISIS DE TRABAJO SEGURO (ATS)",
    PERMISO_ALTURAS: "PERMISO DE TRABAJO EN ALTURAS",
    PERMISO_ESPACIOS_CONFINADOS: "PERMISO DE ESPACIOS CONFINADOS",
    PERMISO_TRABAJO: "PERMISO DE TRABAJO",
};

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        const body = await request.json();
        const { documentType, content, completedAt, documentLabel, instanceId } = body;

        if (!documentType || !content || !completedAt) {
            return NextResponse.json(
                { error: "Datos incompletos" },
                { status: 400 }
            );
        }

        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        let yPos = margin;

        // Helper para agregar texto
        const addText = (
            text: string,
            size = 10,
            isBold = false,
            color: [number, number, number] = [0, 0, 0]
        ) => {
            pdf.setFontSize(size);
            pdf.setFont("helvetica", isBold ? "bold" : "normal");
            pdf.setTextColor(color[0], color[1], color[2]);
            const lines = pdf.splitTextToSize(text, pageWidth - margin * 2);

            // Verificar si necesitamos una nueva página
            if (yPos + lines.length * size * 0.35 > pageHeight - margin) {
                pdf.addPage();
                yPos = margin;
            }

            pdf.text(lines, margin, yPos);
            yPos += lines.length * size * 0.35 + 5;
        };

        // Helper para agregar título de sección
        const addSectionTitle = (title: string) => {
            yPos += 5;
            addText(title, 12, true, [33, 150, 243]);
            yPos += 3;
        };

        // Header del documento
        pdf.setFillColor(33, 150, 243);
        pdf.rect(0, 0, pageWidth, 30, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.text(documentTitles[documentType] || documentLabel || "DOCUMENTO SST", pageWidth / 2, 20, {
            align: "center",
        });

        yPos = 45;
        pdf.setTextColor(0, 0, 0);

        // Fecha de completado
        addText(
            `Fecha de Emisión: ${new Date(completedAt).toLocaleString("es-CO")}`,
            9,
            false,
            [100, 100, 100]
        );
        yPos += 10;

        // Generar contenido según tipo de documento
        switch (documentType) {
            case "CHARLA_SEGURIDAD":
                generateCharlaSeguridad(pdf, content, addText, addSectionTitle);
                break;
            case "ATS":
                generateATS(pdf, content, addText, addSectionTitle);
                break;
            case "PERMISO_ALTURAS":
                generatePermisoAlturas(pdf, content, addText, addSectionTitle);
                break;
            case "PERMISO_ESPACIOS_CONFINADOS":
                generatePermisoEspacios(pdf, content, addText, addSectionTitle);
                break;
            case "PERMISO_TRABAJO":
                generatePermisoTrabajo(pdf, content, addText, addSectionTitle);
                break;
            default:
                addText("Contenido del documento");
        }

        // Footer en cada página
        const totalPages = (pdf as any).internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, {
                align: "center",
            });
        }

        // Convertir a buffer
        const buffer = Buffer.from(pdf.output("arraybuffer"));

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${documentLabel}_${new Date(completedAt)
                    .toISOString()
                    .split("T")[0]}.pdf"`,
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

function generateCharlaSeguridad(pdf: any, content: any, addText: Function, addSectionTitle: Function) {
    addSectionTitle("INFORMACIÓN GENERAL");
    if (content.fecha) addText(`Fecha: ${content.fecha}`);
    if (content.hora) addText(`Hora: ${content.hora}`);
    if (content.lugar) addText(`Lugar: ${content.lugar}`);
    if (content.responsable) addText(`Responsable: ${content.responsable}`);
    if (content.duracion) addText(`Duración: ${content.duracion} minutos`);

    if (content.temas && content.temas.length > 0) {
        addSectionTitle("TEMAS TRATADOS");
        content.temas.forEach((tema: string, idx: number) => {
            addText(`${idx + 1}. ${tema}`);
        });
    }

    if (content.asistentes && content.asistentes.length > 0) {
        addSectionTitle("ASISTENTES");
        content.asistentes.forEach((asistente: any, idx: number) => {
            addText(
                `${idx + 1}. ${asistente.nombre} - CC: ${asistente.cedula} - Cargo: ${asistente.cargo}`
            );
        });
    }

    if (content.riesgosIdentificados && content.riesgosIdentificados.length > 0) {
        addSectionTitle("RIESGOS IDENTIFICADOS");
        content.riesgosIdentificados.forEach((riesgo: string, idx: number) => {
            addText(`${idx + 1}. ${riesgo}`);
        });
    }

    if (content.medidasControl && content.medidasControl.length > 0) {
        addSectionTitle("MEDIDAS DE CONTROL");
        content.medidasControl.forEach((medida: string, idx: number) => {
            addText(`${idx + 1}. ${medida}`);
        });
    }

    if (content.observaciones) {
        addSectionTitle("OBSERVACIONES");
        addText(content.observaciones);
    }
}

function generateATS(pdf: any, content: any, addText: Function, addSectionTitle: Function) {
    addSectionTitle("INFORMACIÓN GENERAL");
    if (content.fecha) addText(`Fecha: ${content.fecha}`);
    if (content.lugar) addText(`Lugar: ${content.lugar}`);
    if (content.responsable) addText(`Responsable: ${content.responsable}`);
    if (content.trabajoRealizar) addText(`Trabajo a Realizar: ${content.trabajoRealizar}`);

    if (content.personal && content.personal.length > 0) {
        addSectionTitle("PERSONAL");
        content.personal.forEach((persona: string, idx: number) => {
            addText(`${idx + 1}. ${persona}`);
        });
    }

    if (content.pasosTrabajo && content.pasosTrabajo.length > 0) {
        addSectionTitle("ANÁLISIS DE TRABAJO SEGURO");
        content.pasosTrabajo.forEach((paso: any, idx: number) => {
            addText(`Paso ${idx + 1}: ${paso.descripcion}`, 10, true);
            if (paso.riesgos && paso.riesgos.length > 0) {
                paso.riesgos.forEach((riesgo: any) => {
                    addText(
                        `  - Riesgo: ${riesgo.descripcion} (${riesgo.nivelRiesgo})`
                    );
                    if (riesgo.controles && riesgo.controles.length > 0) {
                        riesgo.controles.forEach((control: string) => {
                            addText(`    • Control: ${control}`);
                        });
                    }
                });
            }
        });
    }

    if (content.eppRequerido && content.eppRequerido.length > 0) {
        addSectionTitle("EPP REQUERIDO");
        content.eppRequerido.forEach((epp: string, idx: number) => {
            addText(`${idx + 1}. ${epp}`);
        });
    }

    if (content.herramientas && content.herramientas.length > 0) {
        addSectionTitle("HERRAMIENTAS");
        content.herramientas.forEach((herramienta: string, idx: number) => {
            addText(`${idx + 1}. ${herramienta}`);
        });
    }
}

function generatePermisoAlturas(pdf: any, content: any, addText: Function, addSectionTitle: Function) {
    addText("⚠️ PERMISO DE ALTO RIESGO - TRABAJO EN ALTURAS", 14, true, [255, 152, 0]);

    addSectionTitle("INFORMACIÓN DEL TRABAJO");
    if (content.fecha) addText(`Fecha: ${content.fecha}`);
    if (content.horaInicio && content.horaFin)
        addText(`Horario: ${content.horaInicio} - ${content.horaFin}`);
    if (content.lugar) addText(`Lugar: ${content.lugar}`);
    if (content.alturaEstimada) addText(`Altura Estimada: ${content.alturaEstimada} metros`);
    if (content.descripcionTrabajo) addText(`Descripción: ${content.descripcionTrabajo}`);

    if (content.tipoTrabajo && content.tipoTrabajo.length > 0) {
        addSectionTitle("TIPO DE TRABAJO");
        content.tipoTrabajo.forEach((tipo: string) => {
            addText(`• ${tipo}`);
        });
    }

    if (content.trabajadores && content.trabajadores.length > 0) {
        addSectionTitle("TRABAJADORES AUTORIZADOS");
        content.trabajadores.forEach((trabajador: any, idx: number) => {
            addText(
                `${idx + 1}. ${trabajador.nombre} - CC: ${trabajador.cedula} - ${trabajador.certificado}`
            );
        });
    }

    if (content.verificaciones) {
        addSectionTitle("VERIFICACIONES DE SEGURIDAD");
        Object.entries(content.verificaciones).forEach(([key, value]) => {
            addText(`${key}: ${value ? "✓" : "✗"}`);
        });
    }

    if (content.equipoProteccion && content.equipoProteccion.length > 0) {
        addSectionTitle("EQUIPO DE PROTECCIÓN");
        content.equipoProteccion.forEach((equipo: string) => {
            addText(`• ${equipo}`);
        });
    }

    if (content.observaciones) {
        addSectionTitle("OBSERVACIONES");
        addText(content.observaciones);
    }
}

function generatePermisoEspacios(pdf: any, content: any, addText: Function, addSectionTitle: Function) {
    addText("⚠️ PERMISO DE ESPACIOS CONFINADOS", 14, true, [255, 0, 0]);
    addSectionTitle("INFORMACIÓN DEL ESPACIO");
    if (content.fecha) addText(`Fecha: ${content.fecha}`);
    if (content.lugar) addText(`Lugar: ${content.lugar}`);
    if (content.tipoEspacio) addText(`Tipo de Espacio: ${content.tipoEspacio}`);
    if (content.descripcionTrabajo) addText(`Trabajo: ${content.descripcionTrabajo}`);

    if (content.trabajadores && content.trabajadores.length > 0) {
        addSectionTitle("PERSONAL AUTORIZADO");
        content.trabajadores.forEach((t: any, idx: number) => {
            addText(`${idx + 1}. ${t.nombre} (${t.rol})`);
        });
    }
}

function generatePermisoTrabajo(pdf: any, content: any, addText: Function, addSectionTitle: Function) {
    addSectionTitle("INFORMACIÓN GENERAL");
    if (content.fecha) addText(`Fecha: ${content.fecha}`);
    if (content.horaInicio && content.horaFin)
        addText(`Horario: ${content.horaInicio} - ${content.horaFin}`);
    if (content.lugar) addText(`Lugar: ${content.lugar}`);
    if (content.descripcionTrabajo) addText(`Descripción: ${content.descripcionTrabajo}`);
    if (content.responsableObra) addText(`Responsable: ${content.responsableObra}`);

    if (content.trabajadores && content.trabajadores.length > 0) {
        addSectionTitle("PERSONAL AUTORIZADO");
        content.trabajadores.forEach((t: any, idx: number) => {
            addText(`${idx + 1}. ${t.nombre} - ${t.cargo}`);
        });
    }

    if (content.riesgosPresentes && content.riesgosPresentes.length > 0) {
        addSectionTitle("RIESGOS IDENTIFICADOS");
        content.riesgosPresentes.forEach((riesgo: string) => {
            addText(`• ${riesgo}`);
        });
    }

    if (content.eppRequerido && content.eppRequerido.length > 0) {
        addSectionTitle("EPP REQUERIDO");
        content.eppRequerido.forEach((epp: string) => {
            addText(`• ${epp}`);
        });
    }
}
