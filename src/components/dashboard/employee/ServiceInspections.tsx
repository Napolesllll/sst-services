"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import EquipmentSelector from "./inspections/EquipmentSelector";
import InspeccionArnesModal from "./inspections/InspeccionArnesModal";
import InspeccionEslingaModal from "./inspections/InspeccionEslingaModal";
import InspeccionLineaVidaModal from "./inspections/InspeccionLineaVidaModal";
import InspeccionEscaleraModal from "./inspections/InspeccionEscaleraModal";

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

export default function ServiceInspections({
  serviceId,
  serviceType,
  status,
  inspections,
}: ServiceInspectionsProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"selector" | "list">("selector");

  const requiredInspections = getRequiredInspections(serviceType);

  // Obtener tipos de inspecciones completadas
  const completedInspections = inspections
    .filter((i) => i.completedAt)
    .map((i) => i.inspectionType);

  const handleSelectEquipment = (equipmentType: string) => {
    setSelectedEquipment(equipmentType);
  };

  const handleCloseModal = () => {
    setSelectedEquipment(null);
  };

  const handleSuccess = () => {
    setSelectedEquipment(null);
    // El refresh se hace desde el modal
  };

  // Si no hay inspecciones requeridas
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
      {/* Header con Info y Selector de Vista */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex-1">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
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
            <div>
              <p className="text-sm font-semibold text-blue-400 mb-1">
                Inspecciones Preoperacionales
              </p>
              <p className="text-sm text-gray-300">
                Selecciona los equipos que vas a utilizar y completa sus
                inspecciones. Esto garantiza tu seguridad.
              </p>
            </div>
          </div>
        </div>

        {/* Toggle View Mode */}
        <div className="flex gap-2 bg-gray-800/50 p-1 rounded-lg border border-gray-700">
          <button
            onClick={() => setViewMode("selector")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === "selector"
                ? "bg-primary-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Selector
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === "list"
                ? "bg-primary-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Lista
          </button>
        </div>
      </div>

      {/* Vista Selector (Nueva) */}
      {viewMode === "selector" && (
        <EquipmentSelector
          serviceType={serviceType}
          onSelectEquipment={handleSelectEquipment}
          completedInspections={completedInspections}
        />
      )}

      {/* Vista Lista (Original mejorada) */}
      {viewMode === "list" && (
        <div className="space-y-6">
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
                  {requiredInspections.length} Inspecciones Requeridas
                </p>
                <p className="text-sm text-gray-300">
                  Todas deben ser completadas antes de iniciar el trabajo
                </p>
              </div>
            </div>
          </div>

          {/* Lista agrupada por categorías */}
          {Object.entries(
            requiredInspections.reduce((acc, inspType) => {
              // Usar la misma lógica de categorías del EquipmentSelector
              const categories: { [key: string]: string } = {
                ARNES: "EPP Crítico",
                ESLINGA: "EPP Crítico",
                LINEA_VIDA: "Sistema de Protección",
                TRIPODE: "Sistema de Protección",
                ESCALERA: "Estructura",
                ANDAMIO: "Estructura",
                HERRAMIENTA_TALADRO: "Herramienta Eléctrica",
                HERRAMIENTA_PULIDORA: "Herramienta Eléctrica",
                MEDICION_GASES: "Atmósfera",
                VENTILACION: "Atmósfera",
                EQUIPO_RESCATE: "Equipo de Rescate",
                CARGA_DOCUMENTOS: "Administrativo",
                VALIDACION_SOPORTES: "Administrativo",
                FIRMA_DIGITAL: "Administrativo",
                CHECKLIST_CUMPLIMIENTO: "Administrativo",
              };

              const category = categories[inspType] || "Otro";
              if (!acc[category]) acc[category] = [];
              acc[category].push(inspType);
              return acc;
            }, {} as { [key: string]: string[] })
          ).map(([category, inspTypes]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                {category}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inspTypes.map((inspType) => {
                  const inspStatus = inspections.find(
                    (i) => i.inspectionType === inspType
                  );
                  const isCompleted = !!inspStatus?.completedAt;
                  const isPassed = inspStatus?.passed ?? false;

                  // Configuración de iconos
                  const icons: { [key: string]: string } = {
                    ARNES: "🦺",
                    ESLINGA: "🔗",
                    LINEA_VIDA: "➰",
                    ESCALERA: "🪜",
                    ANDAMIO: "🏗️",
                    TRIPODE: "▲",
                    HERRAMIENTA_TALADRO: "🔧",
                    HERRAMIENTA_PULIDORA: "⚙️",
                    MEDICION_GASES: "🌫️",
                    VENTILACION: "💨",
                    EQUIPO_RESCATE: "🚑",
                    CARGA_DOCUMENTOS: "📄",
                    VALIDACION_SOPORTES: "✓",
                    FIRMA_DIGITAL: "✍️",
                    CHECKLIST_CUMPLIMIENTO: "📋",
                  };

                  const labels: { [key: string]: string } = {
                    ARNES: "Arnés de Seguridad",
                    ESLINGA: "Eslinga de Seguridad",
                    LINEA_VIDA: "Línea de Vida",
                    ESCALERA: "Escalera",
                    ANDAMIO: "Andamio",
                    TRIPODE: "Trípode",
                    HERRAMIENTA_TALADRO: "Taladro",
                    HERRAMIENTA_PULIDORA: "Pulidora",
                    MEDICION_GASES: "Medición de Gases",
                    VENTILACION: "Sistema de Ventilación",
                    EQUIPO_RESCATE: "Equipo de Rescate",
                    CARGA_DOCUMENTOS: "Carga de Documentos",
                    VALIDACION_SOPORTES: "Validación de Soportes",
                    FIRMA_DIGITAL: "Firma Digital",
                    CHECKLIST_CUMPLIMIENTO: "Checklist de Cumplimiento",
                  };

                  return (
                    <motion.div
                      key={inspType}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        isCompleted && isPassed
                          ? "bg-green-500/10 border-green-500/30"
                          : isCompleted && !isPassed
                          ? "bg-red-500/10 border-red-500/30"
                          : "bg-gray-800/50 border-gray-700 hover:border-primary-500/50"
                      }`}
                      onClick={() => handleSelectEquipment(inspType)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`text-3xl ${
                            isCompleted ? "grayscale-0" : "grayscale opacity-50"
                          }`}
                        >
                          {icons[inspType] || "📋"}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white text-sm">
                              {labels[inspType] || inspType}
                            </h4>
                            {isCompleted ? (
                              isPassed ? (
                                <span className="text-xs text-green-400 font-bold">
                                  ✓ APTA
                                </span>
                              ) : (
                                <span className="text-xs text-red-400 font-bold">
                                  ✗ NO APTA
                                </span>
                              )
                            ) : (
                              <span className="text-xs text-gray-500">
                                ○ Pendiente
                              </span>
                            )}
                          </div>

                          {inspStatus?.observations && (
                            <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                              {inspStatus.observations}
                            </p>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectEquipment(inspType);
                            }}
                            disabled={status !== "IN_PROGRESS"}
                            className={`w-full px-3 py-1.5 rounded text-xs font-medium transition-all ${
                              isCompleted
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-primary-500 text-white hover:bg-primary-600"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {isCompleted ? "Ver Inspección" : "Inspeccionar"}
                          </button>
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
                <p className="text-sm text-gray-400">
                  Progreso de Inspecciones
                </p>
                <p className="text-2xl font-bold text-white">
                  {completedInspections.length} / {requiredInspections.length}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Aprobadas</p>
                  <p className="text-lg font-bold text-green-400">
                    {
                      inspections.filter(
                        (i) =>
                          i.passed &&
                          requiredInspections.includes(i.inspectionType)
                      ).length
                    }
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Pendientes</p>
                  <p className="text-lg font-bold text-yellow-400">
                    {requiredInspections.length - completedInspections.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modales de Inspección */}
      {selectedEquipment === "ARNES" && (
        <InspeccionArnesModal
          serviceId={serviceId}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}

      {selectedEquipment === "ESLINGA" && (
        <InspeccionEslingaModal
          serviceId={serviceId}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}

      {selectedEquipment === "LINEA_VIDA" && (
        <InspeccionLineaVidaModal
          serviceId={serviceId}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}

      {selectedEquipment === "ESCALERA" && (
        <InspeccionEscaleraModal
          serviceId={serviceId}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}

      {/* Modal temporal para equipos pendientes */}
      {selectedEquipment &&
        !["ARNES", "ESLINGA", "LINEA_VIDA", "ESCALERA"].includes(
          selectedEquipment
        ) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Próximamente
                </h3>
                <p className="text-gray-400 mb-6">
                  La inspección de{" "}
                  <span className="text-primary-400 font-semibold">
                    {selectedEquipment}
                  </span>{" "}
                  estará disponible pronto. Estamos trabajando en implementarla.
                </p>
                <button
                  onClick={handleCloseModal}
                  className="w-full px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-medium"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
    </motion.div>
  );
}
