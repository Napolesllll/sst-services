"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import CharlaSeguridadModal from "./CharlaSeguridadModal";

interface Document {
  id: string;
  documentType: string;
  completedAt: string | null;
  content: any;
}

interface ServiceDocumentsProps {
  serviceId: string;
  serviceType: string;
  status: string;
  documents: Document[];
}

// Configuración de documentos requeridos según el tipo de servicio
const getRequiredDocuments = (serviceType: string): string[] => {
  // Documentos base que SIEMPRE se requieren para tareas críticas
  const baseDocuments = ["CHARLA_SEGURIDAD", "ATS"];

  // Documentos específicos según el tipo de servicio
  const specificDocuments: { [key: string]: string[] } = {
    COORDINADOR_ALTURAS: ["PERMISO_ALTURAS"],
    SUPERVISOR_ESPACIOS_CONFINADOS: ["PERMISO_ESPACIOS_CONFINADOS"],
    ANDAMIERO: ["PERMISO_ALTURAS"],
    RESCATISTA: ["PERMISO_ALTURAS", "PERMISO_ESPACIOS_CONFINADOS"],
    // Servicios que requieren permisos especiales
    PROFESIONAL_SST: ["PERMISO_TRABAJO"],
    TECNOLOGO_SST: ["PERMISO_TRABAJO"],
    TECNICO_SST: ["PERMISO_TRABAJO"],
    // Servicios administrativos
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
};

const documentConfig: {
  [key: string]: { label: string; description: string; icon: string };
} = {
  CHARLA_SEGURIDAD: {
    label: "Charla de Seguridad",
    description: "Registro de charla de seguridad pre-operacional",
    icon: "🗣️",
  },
  ATS: {
    label: "ATS - Análisis de Trabajo Seguro",
    description: "Identificación de riesgos y medidas de control",
    icon: "📊",
  },
  PERMISO_TRABAJO: {
    label: "Permiso de Trabajo",
    description: "Autorización general para realizar el trabajo",
    icon: "✅",
  },
  PERMISO_ALTURAS: {
    label: "Permiso de Trabajo en Alturas",
    description: "Autorización específica para trabajo en alturas",
    icon: "⬆️",
  },
  PERMISO_ESPACIOS_CONFINADOS: {
    label: "Permiso de Espacios Confinados",
    description: "Autorización para ingreso a espacios confinados",
    icon: "🚪",
  },
  PERMISO_TRABAJO_CALIENTE: {
    label: "Permiso de Trabajo en Caliente",
    description: "Autorización para trabajos con generación de chispa o calor",
    icon: "🔥",
  },
  PERMISO_ENERGIAS_PELIGROSAS: {
    label: "Permiso de Energías Peligrosas (LOTO)",
    description: "Control de energías peligrosas - Bloqueo y etiquetado",
    icon: "⚡",
  },
};

export default function ServiceDocuments({
  serviceId,
  serviceType,
  status,
  documents,
}: ServiceDocumentsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [showCharlModal, setShowCharlModal] = useState(false);

  const requiredDocuments = getRequiredDocuments(serviceType);

  const getDocumentStatus = (docType: string) => {
    const doc = documents.find((d) => d.documentType === docType);
    return doc ? (doc.completedAt ? "completed" : "in-progress") : "pending";
  };

  const handleCreateDocument = async (documentType: string) => {
    setSelectedDocument(documentType);

    // Abrir modal según el tipo de documento
    if (documentType === "CHARLA_SEGURIDAD") {
      setShowCharlModal(true);
    } else {
      // Por ahora, alert para otros documentos
      alert(
        `Crear documento: ${documentConfig[documentType].label} - Próximamente`
      );
    }
  };

  const handleDocumentSuccess = () => {
    setShowCharlModal(false);
    setSelectedDocument(null);
    // Recargar la página para mostrar el documento completado
    router.refresh();
  };

  if (requiredDocuments.length === 0) {
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
          Sin Documentos Requeridos
        </h3>
        <p className="text-gray-400">
          Este tipo de servicio no requiere documentos de seguridad específicos
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Alerta informativa */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-400 mt-0.5"
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
              Documentos Obligatorios Detectados
            </p>
            <p className="text-sm text-gray-300">
              Según el tipo de servicio ({serviceType}), se requieren{" "}
              {requiredDocuments.length} documentos obligatorios antes de
              iniciar el trabajo.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de documentos */}
      <div className="grid grid-cols-1 gap-4">
        {requiredDocuments.map((docType, index) => {
          const config = documentConfig[docType];
          const docStatus = getDocumentStatus(docType);
          const existingDoc = documents.find((d) => d.documentType === docType);

          return (
            <motion.div
              key={docType}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-5 rounded-lg border transition-all ${
                docStatus === "completed"
                  ? "bg-green-500/10 border-green-500/30"
                  : docStatus === "in-progress"
                  ? "bg-yellow-500/10 border-yellow-500/30"
                  : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icono */}
                  <div
                    className={`text-4xl ${
                      docStatus === "completed"
                        ? "grayscale-0"
                        : "grayscale opacity-50"
                    }`}
                  >
                    {config.icon}
                  </div>

                  {/* Información */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white">
                        {config.label}
                      </h4>
                      {docStatus === "completed" && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/50">
                          ✓ Completado
                        </span>
                      )}
                      {docStatus === "in-progress" && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-500/50">
                          En progreso
                        </span>
                      )}
                      {docStatus === "pending" && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/50">
                          Pendiente
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      {config.description}
                    </p>

                    {existingDoc?.completedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Completado:{" "}
                        {new Date(existingDoc.completedAt).toLocaleString(
                          "es-CO"
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  {docStatus === "completed" ? (
                    <>
                      <Button variant="secondary" size="sm">
                        Ver
                      </Button>
                      <Button variant="secondary" size="sm">
                        PDF
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleCreateDocument(docType)}
                      disabled={status !== "IN_PROGRESS"}
                    >
                      {docStatus === "in-progress" ? "Continuar" : "Completar"}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Resumen */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Progreso de Documentación</p>
            <p className="text-2xl font-bold text-white">
              {
                documents.filter(
                  (d) =>
                    d.completedAt && requiredDocuments.includes(d.documentType)
                ).length
              }{" "}
              / {requiredDocuments.length}
            </p>
          </div>
          <div className="text-right">
            <div className="w-32 h-32 relative">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${
                    (documents.filter(
                      (d) =>
                        d.completedAt &&
                        requiredDocuments.includes(d.documentType)
                    ).length /
                      requiredDocuments.length) *
                    352
                  } 352`}
                  className="text-primary-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {Math.round(
                    (documents.filter(
                      (d) =>
                        d.completedAt &&
                        requiredDocuments.includes(d.documentType)
                    ).length /
                      requiredDocuments.length) *
                      100
                  )}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Charla de Seguridad */}
      {showCharlModal && (
        <CharlaSeguridadModal
          serviceId={serviceId}
          onClose={() => setShowCharlModal(false)}
          onSuccess={handleDocumentSuccess}
        />
      )}
    </motion.div>
  );
}
