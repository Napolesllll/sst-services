// lib/serviceDocuments.ts
// Helper para obtener documentos e inspecciones requeridos según configuración

import { prisma } from "@/lib/prisma";

/**
 * Obtiene los documentos requeridos para un tipo de servicio
 * Primero intenta obtenerlos de la base de datos (configuración dinámica)
 * Si no existe configuración, usa valores por defecto
 */
export async function getRequiredDocuments(serviceType: string): Promise<string[]> {
    try {
        // Intentar obtener configuración de la base de datos
        const config = await prisma.serviceConfiguration.findUnique({
            where: {
                serviceType: serviceType as any,
            },
        });

        // Si existe configuración y está activa, usarla
        if (config && config.active) {
            return config.requiredDocs;
        }

        // Fallback a configuración por defecto
        return getDefaultRequiredDocuments(serviceType);
    } catch (error) {
        console.error("Error fetching required documents:", error);
        // En caso de error, usar configuración por defecto
        return getDefaultRequiredDocuments(serviceType);
    }
}

/**
 * Obtiene las inspecciones requeridas para un tipo de servicio
 */
export async function getRequiredInspections(serviceType: string): Promise<string[]> {
    try {
        const config = await prisma.serviceConfiguration.findUnique({
            where: {
                serviceType: serviceType as any,
            },
        });

        if (config && config.active) {
            return config.requiredInspections;
        }

        return getDefaultRequiredInspections(serviceType);
    } catch (error) {
        console.error("Error fetching required inspections:", error);
        return getDefaultRequiredInspections(serviceType);
    }
}

/**
 * Configuración por defecto de documentos obligatorios
 */
function getDefaultRequiredDocuments(serviceType: string): string[] {
    // Documentos base para tareas críticas
    const baseDocuments = ["CHARLA_SEGURIDAD", "ATS"];

    // Documentos específicos según el tipo de servicio
    const specificDocuments: { [key: string]: string[] } = {
        COORDINADOR_ALTURAS: ["PERMISO_ALTURAS"],
        SUPERVISOR_ESPACIOS_CONFINADOS: ["PERMISO_ESPACIOS_CONFINADOS"],
        ANDAMIERO: ["PERMISO_ALTURAS"],
        RESCATISTA: ["PERMISO_ALTURAS", "PERMISO_ESPACIOS_CONFINADOS"],
        PROFESIONAL_SST: ["PERMISO_TRABAJO"],
        TECNOLOGO_SST: ["PERMISO_TRABAJO"],
        TECNICO_SST: ["PERMISO_TRABAJO"],
        // Servicios administrativos sin documentos
        SERVICIOS_ADMINISTRATIVOS: [],
        NOMINA: [],
        FACTURACION: [],
        CONTRATOS: [],
        SEGURIDAD_SOCIAL: [],
    };

    const specific = specificDocuments[serviceType] || ["PERMISO_TRABAJO"];

    // Para servicios administrativos, no incluir documentos base
    if (
        [
            "SERVICIOS_ADMINISTRATIVOS",
            "NOMINA",
            "FACTURACION",
            "CONTRATOS",
            "SEGURIDAD_SOCIAL",
        ].includes(serviceType)
    ) {
        return [];
    }

    return [...baseDocuments, ...specific];
}

/**
 * Configuración por defecto de inspecciones obligatorias
 */
function getDefaultRequiredInspections(serviceType: string): string[] {
    const inspectionMap: { [key: string]: string[] } = {
        COORDINADOR_ALTURAS: ["ARNES", "ESLINGA", "LINEA_VIDA", "ESCALERA"],
        SUPERVISOR_ESPACIOS_CONFINADOS: ["MEDICION_GASES", "TRIPODE", "VENTILACION", "EQUIPO_RESCATE"],
        ANDAMIERO: ["ANDAMIO", "ARNES", "ESCALERA"],
        RESCATISTA: ["ARNES", "EQUIPO_RESCATE", "LINEA_VIDA"],
        ALQUILER_EQUIPOS: ["HERRAMIENTA_TALADRO", "HERRAMIENTA_PULIDORA"],
        TECNICO_SST: ["ARNES", "ESCALERA"],
        // Servicios administrativos sin inspecciones
        SERVICIOS_ADMINISTRATIVOS: [],
        NOMINA: [],
        FACTURACION: [],
        CONTRATOS: [],
        SEGURIDAD_SOCIAL: [],
    };

    return inspectionMap[serviceType] || [];
}

/**
 * Verifica si un servicio tiene todos los documentos requeridos completados
 */
export async function hasAllRequiredDocuments(
    serviceType: string,
    completedDocuments: string[]
): Promise<boolean> {
    const required = await getRequiredDocuments(serviceType);

    if (required.length === 0) {
        return true; // No hay documentos requeridos
    }

    return required.every(doc => completedDocuments.includes(doc));
}

/**
 * Verifica si un servicio tiene todas las inspecciones requeridas completadas
 */
export async function hasAllRequiredInspections(
    serviceType: string,
    completedInspections: string[]
): Promise<boolean> {
    const required = await getRequiredInspections(serviceType);

    if (required.length === 0) {
        return true; // No hay inspecciones requeridas
    }

    return required.every(insp => completedInspections.includes(insp));
}

/**
 * Calcula el progreso de documentación de un servicio
 */
export async function calculateDocumentationProgress(
    serviceType: string,
    completedDocuments: string[],
    completedInspections: string[]
): Promise<{
    documentsProgress: number;
    inspectionsProgress: number;
    overallProgress: number;
    isComplete: boolean;
}> {
    const requiredDocs = await getRequiredDocuments(serviceType);
    const requiredInsps = await getRequiredInspections(serviceType);

    const completedDocsCount = requiredDocs.filter(doc =>
        completedDocuments.includes(doc)
    ).length;

    const completedInspsCount = requiredInsps.filter(insp =>
        completedInspections.includes(insp)
    ).length;

    const documentsProgress = requiredDocs.length > 0
        ? (completedDocsCount / requiredDocs.length) * 100
        : 100;

    const inspectionsProgress = requiredInsps.length > 0
        ? (completedInspsCount / requiredInsps.length) * 100
        : 100;

    const totalRequired = requiredDocs.length + requiredInsps.length;
    const totalCompleted = completedDocsCount + completedInspsCount;

    const overallProgress = totalRequired > 0
        ? (totalCompleted / totalRequired) * 100
        : 100;

    const isComplete = overallProgress === 100;

    return {
        documentsProgress: Math.round(documentsProgress),
        inspectionsProgress: Math.round(inspectionsProgress),
        overallProgress: Math.round(overallProgress),
        isComplete,
    };
}