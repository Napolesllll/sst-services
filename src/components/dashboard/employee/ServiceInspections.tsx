"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

interface Inspection {
  id: string;
  inspectionType: string;
  passed: boolean;
  completedAt: string | null;
  observations: string | null;
}

interface ServiceInspectionsProps {
  serviceId: string;
  serviceType: string;
  status: string;
  inspections: Inspection[];
}

// Configuración de inspecciones según el tipo de servicio
const getRequiredInspections = (serviceType: string): string[] => {
  const inspectionsByType: { [key: string]: string[] } = {
    // Trabajo en alturas
    COORDINADOR_ALTURAS: ["ARNES", "ESLINGA", "ESCALERA", "LINEA_VIDA"],
    ANDAMIERO: ["ANDAMIO", "ARNES", "ESCALERA", "HERRAMIENTA_TALADRO"],
    // Espacios confinados
    SUPERVISOR_ESPACIOS_CONFINADOS: [
      "MEDICION_GASES",
      "TRIPODE",
      "LINEA_VIDA",
      "VENTILACION",
      "EQUIPO_RESCATE",
    ],
    RESCATISTA: [
      "EQUIPO_RESCATE",
      "ARNES",
      "ESLINGA",
      "TRIPODE",
      "MEDICION_GASES",
    ],
    // Servicios profesionales SST
    PROFESIONAL_SST: ["HERRAMIENTA_TALADRO", "HERRAMIENTA_PULIDORA"],
    TECNOLOGO_SST: ["HERRAMIENTA_TALADRO"],
    TECNICO_SST: ["HERRAMIENTA_TALADRO"],
    // Servicios administrativos
    SERVICIOS_ADMINISTRATIVOS: [
      "CARGA_DOCUMENTOS",
      "VALIDACION_SOPORTES",
      "FIRMA_DIGITAL",
      "CHECKLIST_CUMPLIMIENTO",
    ],
    NOMINA: [
      "CARGA_DOCUMENTOS",
      "VALIDACION_SOPORTES",
      "CHECKLIST_CUMPLIMIENTO",
    ],
    FACTURACION: ["CARGA_DOCUMENTOS", "VALIDACION_SOPORTES", "FIRMA_DIGITAL"],
    CONTRATOS: [
      "CARGA_DOCUMENTOS",
      "VALIDACION_SOPORTES",
      "FIRMA_DIGITAL",
      "CHECKLIST_CUMPLIMIENTO",
    ],
    SEGURIDAD_SOCIAL: [
      "CARGA_DOCUMENTOS",
      "VALIDACION_SOPORTES",
      "CHECKLIST_CUMPLIMIENTO",
    ],
  };

  return inspectionsByType[serviceType] || [];
};

const inspectionConfig: {
  [key: string]: {
    label: string;
    description: string;
    icon: string;
    category: string;
  };
} = {
  // EPP y Equipos de Protección
  ARNES: {
    label: "Arnés de Seguridad",
    description:
      "Verificación de estado, costuras, argollas y fecha de vencimiento",
    icon: "🦺",
    category: "EPP",
  },
  ESLINGA: {
    label: "Eslinga de Seguridad",
    description: "Inspección visual de desgaste, roturas y conectores",
    icon: "🔗",
    category: "EPP",
  },
  // Estructuras
  ESCALERA: {
    label: "Escalera",
    description: "Estado de peldaños, patas antideslizantes y estructura",
    icon: "🪜",
    category: "Estructura",
  },
  ANDAMIO: {
    label: "Andamio",
    description: "Estabilidad, arriostramientos, plataformas y barandas",
    icon: "🏗️",
    category: "Estructura",
  },
  // Líneas de vida
  LINEA_VIDA: {
    label: "Línea de Vida",
    description: "Puntos de anclaje, tensión y ausencia de daños",
    icon: "➰",
    category: "Sistema de Protección",
  },
  TRIPODE: {
    label: "Trípode",
    description: "Estabilidad, winch, cable y capacidad de carga",
    icon: "△",
    category: "Sistema de Protección",
  },
  // Espacios confinados
  MEDICION_GASES: {
    label: "Medición de Gases",
    description: "O₂, CO, H₂S y gases explosivos",
    icon: "🌫️",
    category: "Atmósfera",
  },
  VENTILACION: {
    label: "Sistema de Ventilación",
    description: "Funcionamiento, flujo de aire y extractores",
    icon: "💨",
    category: "Atmósfera",
  },
  // Equipos de rescate
  EQUIPO_RESCATE: {
    label: "Equipo de Rescate",
    description: "Camilla, botiquín, comunicación y plan de emergencia",
    icon: "🚑",
    category: "Emergencia",
  },
  // Herramientas
  HERRAMIENTA_TALADRO: {
    label: "Taladro",
    description: "Cable, interruptor, chuck y accesorios",
    icon: "🔧",
    category: "Herramienta",
  },
  HERRAMIENTA_PULIDORA: {
    label: "Pulidora",
    description: "Guarda, disco, cable y empuñadura",
    icon: "⚙️",
    category: "Herramienta",
  },
  // Administrativos
  CARGA_DOCUMENTOS: {
    label: "Carga de Documentos",
    description: "Documentos completos y legibles",
    icon: "📄",
    category: "Administrativo",
  },
  VALIDACION_SOPORTES: {
    label: "Validación de Soportes",
    description: "Verificación de autenticidad y completitud",
    icon: "✓",
    category: "Administrativo",
  },
  FIRMA_DIGITAL: {
    label: "Firma Digital",
    description: "Firmas autorizadas y certificadas",
    icon: "✍️",
    category: "Administrativo",
  },
  CHECKLIST_CUMPLIMIENTO: {
    label: "Checklist de Cumplimiento",
    description: "Verificación de requisitos legales",
    icon: "📋",
    category: "Administrativo",
  },
};

export default function ServiceInspections({
  serviceId,
  serviceType,
  status,
  inspections,
}: ServiceInspectionsProps) {
  const requiredInspections = getRequiredInspections(serviceType);

  const getInspectionStatus = (inspType: string) => {
    const insp = inspections.find((i) => i.inspectionType === inspType);
    return insp ? (insp.completedAt ? "completed" : "in-progress") : "pending";
  };

  const handleCreateInspection = (inspectionType: string) => {
    alert(`Realizar inspección: ${inspectionConfig[inspectionType].label}`);
  };

  // Agrupar inspecciones por categoría
  const groupedInspections = requiredInspections.reduce((acc, inspType) => {
    const category = inspectionConfig[inspType]?.category || "Otro";
    if (!acc[category]) acc[category] = [];
    acc[category].push(inspType);
    return acc;
  }, {} as { [key: string]: string[] });

  if (requiredInspections.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
          <svg
            className="w-8 h-8 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Sin Inspecciones Requeridas
        </h3>
        <p className="text-gray-400">
          Este tipo de servicio no requiere inspecciones preoperacionales
          específicas
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Alerta informativa */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-yellow-400 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-yellow-400 mb-1">
              Inspecciones Preoperacionales Detectadas
            </p>
            <p className="text-sm text-gray-300">
              Se requieren {requiredInspections.length} inspecciones según el
              tipo de servicio. Todas deben ser completadas antes de iniciar el
              trabajo.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de inspecciones agrupadas por categoría */}
      {Object.entries(groupedInspections).map(([category, inspTypes]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-500"></div>
            {category}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inspTypes.map((inspType) => {
              const config = inspectionConfig[inspType];
              const inspStatus = getInspectionStatus(inspType);
              const existingInsp = inspections.find(
                (i) => i.inspectionType === inspType
              );

              return (
                <motion.div
                  key={inspType}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-lg border transition-all ${
                    inspStatus === "completed"
                      ? "bg-green-500/10 border-green-500/30"
                      : inspStatus === "in-progress"
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`text-3xl ${
                        inspStatus === "completed"
                          ? "grayscale-0"
                          : "grayscale opacity-50"
                      }`}
                    >
                      {config.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white text-sm">
                          {config.label}
                        </h4>
                        {inspStatus === "completed" ? (
                          <span className="text-xs text-green-400">✓</span>
                        ) : inspStatus === "in-progress" ? (
                          <span className="text-xs text-yellow-400">⏳</span>
                        ) : (
                          <span className="text-xs text-gray-500">○</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-3">
                        {config.description}
                      </p>

                      {existingInsp?.completedAt ? (
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" fullWidth>
                            Ver
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          onClick={() => handleCreateInspection(inspType)}
                          disabled={status !== "IN_PROGRESS"}
                        >
                          {inspStatus === "in-progress"
                            ? "Continuar"
                            : "Inspeccionar"}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Resumen */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Progreso de Inspecciones</p>
            <p className="text-2xl font-bold text-white">
              {
                inspections.filter(
                  (i) =>
                    i.completedAt &&
                    requiredInspections.includes(i.inspectionType)
                ).length
              }{" "}
              / {requiredInspections.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Aprobadas</p>
              <p className="text-lg font-bold text-green-400">
                {
                  inspections.filter(
                    (i) =>
                      i.passed && requiredInspections.includes(i.inspectionType)
                  ).length
                }
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Pendientes</p>
              <p className="text-lg font-bold text-yellow-400">
                {requiredInspections.length -
                  inspections.filter(
                    (i) =>
                      i.completedAt &&
                      requiredInspections.includes(i.inspectionType)
                  ).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
