// lib/wordProcessor.ts
import mammoth from "mammoth";

interface ExtractedData {
    [key: string]: any;
}

/**
 * Procesa un archivo Word y extrae datos según el tipo de documento
 */
export async function processWordFile(
    buffer: Buffer,
    documentType: string
): Promise<ExtractedData> {
    try {
        // Convertir DOCX a HTML/texto
        const result = await mammoth.extractRawText({
            buffer: buffer,
        });

        const text = result.value;

        // Procesar según el tipo de documento
        switch (documentType) {
            case "CHARLA_SEGURIDAD":
                return extractCharlaSeguridad(text);
            case "ATS":
                return extractATS(text);
            case "PERMISO_ALTURAS":
                return extractPermisoAlturas(text);
            case "PERMISO_ESPACIOS_CONFINADOS":
                return extractPermisoEspacios(text);
            case "PERMISO_TRABAJO":
                return extractPermisoTrabajo(text);
            default:
                return extractGenerico(text);
        }
    } catch (error) {
        console.error("Error processing Word file:", error);
        return {};
    }
}

/**
 * Extrae datos de una Charla de Seguridad
 */
function extractCharlaSeguridad(text: string): ExtractedData {
    const data: ExtractedData = {
        tema: "",
        expositor: "",
        participantes: [],
        observaciones: "",
        fechaRealizada: new Date().toISOString().split("T")[0],
    };

    // Extraer tema
    const temaMatch = text.match(/tema[:\s]*([^\n]+)/i);
    if (temaMatch) data.tema = temaMatch[1].trim();

    // Extraer expositor/facilitador
    const expositorMatch = text.match(/expositor|facilitador[:\s]*([^\n]+)/i);
    if (expositorMatch) data.expositor = expositorMatch[1].trim();

    // Extraer participantes (lista de nombres)
    const participantesMatch = text.match(
        /participantes[:\s]*([^\n]+(?:\n[^\n]+)*)/i
    );
    if (participantesMatch) {
        const names = participantesMatch[1]
            .split(/[\n,;]/)
            .map((name) => name.trim())
            .filter((name) => name && name.length > 2);
        data.participantes = names.slice(0, 20);
    }

    // Extraer observaciones
    const obsMatch = text.match(/observaciones[:\s]*([^\n]+(?:\n[^\n]+)*)/i);
    if (obsMatch) {
        data.observaciones = obsMatch[1].trim().substring(0, 500);
    }

    return data;
}

/**
 * Extrae datos de un ATS (Análisis de Trabajo Seguro)
 */
function extractATS(text: string): ExtractedData {
    const data: ExtractedData = {
        tareaDescripcion: "",
        responsable: "",
        riesgos: [],
        medidasControl: [],
        fechaRealizado: new Date().toISOString().split("T")[0],
    };

    // Extraer descripción de tarea
    const tareaMatch = text.match(
        /tarea|descripción[:\s]*([^\n]+(?:\n[^\n]+)*)/i
    );
    if (tareaMatch) {
        data.tareaDescripcion = tareaMatch[1].trim().substring(0, 300);
    }

    // Extraer responsable
    const respMatch = text.match(/responsable|analista[:\s]*([^\n]+)/i);
    if (respMatch) data.responsable = respMatch[1].trim();

    // Extraer riesgos
    const riesgosMatch = text.match(/riesgos[:\s]*([^\n]+(?:\n[^\n]+)*)/i);
    if (riesgosMatch) {
        const riesgos = riesgosMatch[1]
            .split(/[\n-•]/)
            .map((r) => r.trim())
            .filter((r) => r && r.length > 3);
        data.riesgos = riesgos.slice(0, 10);
    }

    // Extraer medidas de control
    const medidasMatch = text.match(
        /medidas|controles[:\s]*([^\n]+(?:\n[^\n]+)*)/i
    );
    if (medidasMatch) {
        const medidas = medidasMatch[1]
            .split(/[\n-•]/)
            .map((m) => m.trim())
            .filter((m) => m && m.length > 3);
        data.medidasControl = medidas.slice(0, 10);
    }

    return data;
}

/**
 * Extrae datos de un Permiso de Alturas
 */
function extractPermisoAlturas(text: string): ExtractedData {
    const data: ExtractedData = {
        altura: "",
        areaTrabajo: "",
        tareaRealizar: "",
        responsableSeguridad: "",
        trabajadores: [],
        equipo: [],
        fechaExpedicion: new Date().toISOString().split("T")[0],
        validezDias: 1,
    };

    // Extraer altura/distancia
    const alturaMatch = text.match(/altura|metros[:\s]*([0-9.]+)/i);
    if (alturaMatch) data.altura = alturaMatch[1].trim();

    // Extraer área de trabajo
    const areaMatch = text.match(/área|ubicación|lugar[:\s]*([^\n]+)/i);
    if (areaMatch) data.areaTrabajo = areaMatch[1].trim();

    // Extraer tarea
    const tareaMatch = text.match(/tarea|trabajo[:\s]*([^\n]+(?:\n[^\n]+)*)/i);
    if (tareaMatch) {
        data.tareaRealizar = tareaMatch[1].trim().substring(0, 200);
    }

    // Extraer responsable de seguridad
    const respMatch = text.match(
        /coordinador|responsable|supervisor[:\s]*([^\n]+)/i
    );
    if (respMatch) data.responsableSeguridad = respMatch[1].trim();

    return data;
}

/**
 * Extrae datos de un Permiso de Espacios Confinados
 */
function extractPermisoEspacios(text: string): ExtractedData {
    const data: ExtractedData = {
        espacioDescripcion: "",
        trabajadores: [],
        medidasPrevention: [],
        gasesMonitoreo: [],
        ventilacion: false,
        equipoRescate: false,
        fechaAutorizacion: new Date().toISOString().split("T")[0],
    };

    // Extraer descripción del espacio
    const espacioMatch = text.match(/espacio|lugar[:\s]*([^\n]+(?:\n[^\n]+)*)/i);
    if (espacioMatch) {
        data.espacioDescripcion = espacioMatch[1].trim().substring(0, 200);
    }

    // Buscar si hay ventilación requerida
    if (/ventilación|ventilacion|air|flujo/.test(text.toLowerCase())) {
        data.ventilacion = true;
    }

    // Buscar si hay equipo de rescate
    if (/rescate|tripode|cable|arnes/.test(text.toLowerCase())) {
        data.equipoRescate = true;
    }

    return data;
}

/**
 * Extrae datos de un Permiso de Trabajo General
 */
function extractPermisoTrabajo(text: string): ExtractedData {
    const data: ExtractedData = {
        tareaDescripcion: "",
        areaTrabajo: "",
        duracionEstimada: "",
        responsableSeguridad: "",
        requierePermisoEspecial: false,
        observaciones: "",
        fechaExpedicion: new Date().toISOString().split("T")[0],
    };

    // Extraer descripción de tarea
    const tareaMatch = text.match(
        /tarea|trabajo[:\s]*([^\n]+(?:\n[^\n]+)*)/i
    );
    if (tareaMatch) {
        data.tareaDescripcion = tareaMatch[1].trim().substring(0, 300);
    }

    // Extraer área
    const areaMatch = text.match(/área|ubicación|departamento[:\s]*([^\n]+)/i);
    if (areaMatch) data.areaTrabajo = areaMatch[1].trim();

    // Extraer duración estimada
    const durMatch = text.match(/duración|tiempo|horas[:\s]*([^\n]+)/i);
    if (durMatch) data.duracionEstimada = durMatch[1].trim();

    // Extraer responsable
    const respMatch = text.match(/responsable|supervisor[:\s]*([^\n]+)/i);
    if (respMatch) data.responsableSeguridad = respMatch[1].trim();

    // Verificar si requiere permisos especiales
    if (
        /alturas|espacios confinados|trabajo caliente|energías peligrosas/.test(
            text.toLowerCase()
        )
    ) {
        data.requierePermisoEspecial = true;
    }

    return data;
}

/**
 * Extrae datos genéricos de cualquier documento
 */
function extractGenerico(text: string): ExtractedData {
    return {
        contenido: text.substring(0, 1000),
        fechaProcesamiento: new Date().toISOString().split("T")[0],
        lineas: text.split("\n").filter((l) => l.trim()).length,
    };
}
