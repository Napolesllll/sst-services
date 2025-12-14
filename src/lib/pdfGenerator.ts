// lib/pdfGenerator.ts
// Esta utilidad genera PDFs de los documentos usando jsPDF

import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Document {
    id: string;
    documentType: string;
    completedAt: string;
    content: any;
}

const documentTitles: { [key: string]: string } = {
    CHARLA_SEGURIDAD: 'CHARLA DE SEGURIDAD',
    ATS: 'ANÁLISIS DE TRABAJO SEGURO (ATS)',
    PERMISO_ALTURAS: 'PERMISO DE TRABAJO EN ALTURAS',
    PERMISO_ESPACIOS_CONFINADOS: 'PERMISO DE ESPACIOS CONFINADOS',
    PERMISO_TRABAJO: 'PERMISO DE TRABAJO',
};

export async function generateDocumentPDF(document: Document): Promise<void> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Helper para agregar texto
    const addText = (text: string, size = 10, isBold = false, color: [number, number, number] = [0, 0, 0]) => {
        pdf.setFontSize(size);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setTextColor(color[0], color[1], color[2]);
        const lines = pdf.splitTextToSize(text, pageWidth - margin * 2);

        // Verificar si necesitamos una nueva página
        if (yPos + (lines.length * size * 0.35) > pageHeight - margin) {
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
    pdf.rect(0, 0, pageWidth, 30, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(documentTitles[document.documentType] || 'DOCUMENTO SST', pageWidth / 2, 20, {
        align: 'center',
    });

    yPos = 45;
    pdf.setTextColor(0, 0, 0);

    // Fecha de completado
    addText(`Fecha de Emisión: ${new Date(document.completedAt).toLocaleString('es-CO')}`, 9, false, [100, 100, 100]);
    yPos += 10;

    // Generar contenido según tipo de documento
    switch (document.documentType) {
        case 'CHARLA_SEGURIDAD':
            generateCharlaSeguridad(pdf, document.content, addText, addSectionTitle);
            break;
        case 'ATS':
            generateATS(pdf, document.content, addText, addSectionTitle);
            break;
        case 'PERMISO_ALTURAS':
            generatePermisoAlturas(pdf, document.content, addText, addSectionTitle);
            break;
        case 'PERMISO_ESPACIOS_CONFINADOS':
            generatePermisoEspacios(pdf, document.content, addText, addSectionTitle);
            break;
        case 'PERMISO_TRABAJO':
            generatePermisoTrabajo(pdf, document.content, addText, addSectionTitle);
            break;
    }

    // Footer en cada página
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
            `Página ${i} de ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    }

    // Descargar PDF
    const fileName = `${documentTitles[document.documentType]}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
}

function generateCharlaSeguridad(pdf: any, content: any, addText: Function, addSectionTitle: Function) {
    addSectionTitle('INFORMACIÓN GENERAL');
    addText(`Fecha: ${content.fecha}`);
    addText(`Hora: ${content.hora}`);
    addText(`Lugar: ${content.lugar}`);
    addText(`Responsable: ${content.responsable}`);
    addText(`Duración: ${content.duracion} minutos`);

    addSectionTitle('TEMAS TRATADOS');
    content.temas.forEach((tema: string, idx: number) => {
        addText(`${idx + 1}. ${tema}`);
    });

    addSectionTitle('ASISTENTES');
    content.asistentes.forEach((asistente: any, idx: number) => {
        addText(`${idx + 1}. ${asistente.nombre} - CC: ${asistente.cedula} - Cargo: ${asistente.cargo}`);
    });

    if (content.riesgosIdentificados && content.riesgosIdentificados.length > 0) {
        addSectionTitle('RIESGOS IDENTIFICADOS');
        content.riesgosIdentificados.forEach((riesgo: string, idx: number) => {
            addText(`• ${riesgo}`);
        });
    }

    if (content.medidasControl && content.medidasControl.length > 0) {
        addSectionTitle('MEDIDAS DE CONTROL');
        content.medidasControl.forEach((medida: string, idx: number) => {
            addText(`${idx + 1}. ${medida}`);
        });
    }

    if (content.observaciones) {
        addSectionTitle('OBSERVACIONES');
        addText(content.observaciones);
    }
}

function generateATS(pdf: any, content: any, addText: Function, addSectionTitle: Function) {
    addSectionTitle('INFORMACIÓN GENERAL');
    addText(`Fecha: ${content.fecha}`);
    addText(`Lugar: ${content.lugar}`);
    addText(`Responsable: ${content.responsable}`);
    addText(`Trabajo a Realizar: ${content.trabajoRealizar}`);

    if (content.personal && content.personal.length > 0) {
        addSectionTitle('PERSONAL INVOLUCRADO');
        content.personal.forEach((persona: string, idx: number) => {
            addText(`${idx + 1}. ${persona}`);
        });
    }

    addSectionTitle('ANÁLISIS DE TRABAJO SEGURO');
    content.pasosTrabajo.forEach((paso: any, idx: number) => {
        addText(`PASO ${idx + 1}: ${paso.descripcion}`, 11, true);

        paso.riesgos.forEach((riesgo: any, rIdx: number) => {
            addText(`   Riesgo ${rIdx + 1} [${riesgo.nivelRiesgo}]: ${riesgo.descripcion}`, 10, false, [200, 0, 0]);
            addText(`   Controles:`, 9, true);
            riesgo.controles.forEach((control: string, cIdx: number) => {
                addText(`      • ${control}`, 9);
            });
        });
    });

    addSectionTitle('EPP REQUERIDO');
    content.eppRequerido.forEach((epp: string, idx: number) => {
        addText(`✓ ${epp}`);
    });

    if (content.herramientas && content.herramientas.length > 0) {
        addSectionTitle('HERRAMIENTAS Y EQUIPOS');
        content.herramientas.forEach((herramienta: string, idx: number) => {
            addText(`• ${herramienta}`);
        });
    }
}

function generatePermisoAlturas(pdf: any, content: any, addText: Function, addSectionTitle: Function) {
    addText('⚠️ PERMISO DE ALTO RIESGO - TRABAJO EN ALTURAS', 14, true, [255, 152, 0]);

    addSectionTitle('INFORMACIÓN DEL TRABAJO');
    addText(`Fecha: ${content.fecha}`);
    addText(`Horario: ${content.horaInicio} - ${content.horaFin}`);
    addText(`Lugar: ${content.lugar}`);
    addText(`Altura Estimada: ${content.alturaEstimada} metros`);
    addText(`Descripción: ${content.descripcionTrabajo}`);

    addSectionTitle('TIPO DE TRABAJO');
    content.tipoTrabajo.forEach((tipo: string) => {
        addText(`• ${tipo}`);
    });

    addSectionTitle('TRABAJADORES AUTORIZADOS');
    content.trabajadores.forEach((trabajador: any, idx: number) => {
        addText(`${idx + 1}. ${trabajador.nombre} - CC: ${trabajador.cedula}`);
        addText(`   Certificado: ${trabajador.certificado} - Vigencia: ${trabajador.vigencia}`, 9);
    });

    addSectionTitle('VERIFICACIONES DE SEGURIDAD');
    Object.entries(content.verificaciones).forEach(([key, value]) => {
        const status = value ? '✓' : '✗';
        const label = key.replace(/([A-Z])/g, ' $1').trim();
        addText(`${status} ${label}`, 10, false, value ? [0, 150, 0] : [200, 0, 0]);
    });

    addSectionTitle('CONDICIONES CLIMÁTICAS');
    addText(`Temperatura: ${content.temperatura}°C`);
    addText(`Viento: ${content.viento} km/h`);
    addText(`Lluvia: ${content.lluvia}`);
    addText(`Visibilidad: ${content.visibilidad}`);

    addSectionTitle('EQUIPO DE PROTECCIÓN');
    content.equipoProteccion.forEach((equipo: string) => {
        addText(`✓ ${equipo}`);
    });

    if (content.observaciones) {
        addSectionTitle('OBSERVACIONES');
        addText(content.observaciones);
    }
}

function generatePermisoEspacios(pdf: any, content: any, addText: Function, addSectionTitle: Function) {
    // Similar a permisoAlturas
    addText('Implementación pendiente para Permiso de Espacios Confinados');
}

function generatePermisoTrabajo(pdf: any, content: any, addText: Function, addSectionTitle: Function) {
    addSectionTitle('INFORMACIÓN GENERAL');
    addText(`Fecha: ${content.fecha}`);
    addText(`Horario: ${content.horaInicio} - ${content.horaFin}`);
    addText(`Lugar: ${content.lugar}`);
    addText(`Área: ${content.area || 'N/A'}`);
    addText(`Descripción: ${content.descripcionTrabajo}`);
    addText(`Responsable: ${content.responsableObra}`);

    if (content.nombreContratista) {
        addText(`Contratista: ${content.nombreContratista}`);
    }

    if (content.telefonoContacto) {
        addText(`Teléfono: ${content.telefonoContacto}`);
    }

    addSectionTitle('PERSONAL AUTORIZADO');
    content.trabajadores.forEach((trabajador: any, idx: number) => {
        addText(`${idx + 1}. ${trabajador.nombre} - CC: ${trabajador.cedula} - ${trabajador.cargo}`);
    });

    addSectionTitle('RIESGOS IDENTIFICADOS');
    content.riesgosPresentes.forEach((riesgo: string) => {
        addText(`• ${riesgo}`);
    });

    addSectionTitle('VERIFICACIONES DE SEGURIDAD');
    Object.entries(content.verificaciones).forEach(([key, value]) => {
        const status = value ? '✓' : '✗';
        const label = key.replace(/([A-Z])/g, ' $1').trim();
        addText(`${status} ${label}`, 10, false, value ? [0, 150, 0] : [200, 0, 0]);
    });

    addSectionTitle('EPP REQUERIDO');
    content.eppRequerido.forEach((epp: string) => {
        addText(`✓ ${epp}`);
    });

    if (content.herramientas && content.herramientas.length > 0) {
        addSectionTitle('HERRAMIENTAS Y EQUIPOS');
        content.herramientas.forEach((herramienta: string) => {
            addText(`• ${herramienta}`);
        });
    }

    if (content.medidasControl && content.medidasControl.length > 0) {
        addSectionTitle('MEDIDAS DE CONTROL');
        content.medidasControl.forEach((medida: string, idx: number) => {
            addText(`${idx + 1}. ${medida}`);
        });
    }

    if (content.observaciones) {
        addSectionTitle('OBSERVACIONES');
        addText(content.observaciones);
    }
}