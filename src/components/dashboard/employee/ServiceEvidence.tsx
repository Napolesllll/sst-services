"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

interface Evidence {
  id: string;
  type: string;
  fileUrl: string | null;
  description: string | null;
  createdAt: string;
}

interface ServiceEvidenceProps {
  serviceId: string;
  status: string;
  evidences: Evidence[];
}

export default function ServiceEvidence({
  serviceId,
  status,
  evidences,
}: ServiceEvidenceProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const evidenceTypes = [
    {
      type: "photo",
      label: "Fotografías",
      icon: "📸",
      description: "Fotos del sitio, equipos y progreso del trabajo",
    },
    {
      type: "signature",
      label: "Firmas",
      icon: "✍️",
      description: "Firmas del trabajador y cliente",
    },
    {
      type: "location",
      label: "Ubicación GPS",
      icon: "📍",
      description: "Coordenadas del sitio de trabajo",
    },
    {
      type: "document",
      label: "Documentos",
      icon: "📄",
      description: "Documentos adicionales y certificados",
    },
  ];

  const getEvidencesByType = (type: string) => {
    return evidences.filter((e) => e.type === type);
  };

  const handleUploadEvidence = (type: string) => {
    setSelectedType(type);
    alert(`Subir evidencia de tipo: ${type}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Info */}
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
              Evidencias del Servicio
            </p>
            <p className="text-sm text-gray-300">
              Documenta tu trabajo con fotos, firmas y ubicación GPS. Las
              evidencias son importantes para el informe final.
            </p>
          </div>
        </div>
      </div>

      {/* Tipos de evidencia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evidenceTypes.map((evidenceType) => {
          const count = getEvidencesByType(evidenceType.type).length;

          return (
            <motion.div
              key={evidenceType.type}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{evidenceType.icon}</div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">
                      {evidenceType.label}
                    </h4>
                    {count > 0 && (
                      <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs font-semibold rounded-full border border-primary-500/50">
                        {count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    {evidenceType.description}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => handleUploadEvidence(evidenceType.type)}
                      disabled={status !== "IN_PROGRESS"}
                      icon={
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      }
                    >
                      Agregar
                    </Button>
                    {count > 0 && (
                      <Button variant="secondary" size="sm">
                        Ver ({count})
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lista de evidencias recientes */}
      {evidences.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Evidencias Recientes ({evidences.length})
          </h3>

          <div className="space-y-3">
            {evidences.slice(0, 5).map((evidence, index) => (
              <motion.div
                key={evidence.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg bg-gray-800/50 border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {
                        evidenceTypes.find((t) => t.type === evidence.type)
                          ?.icon
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {
                          evidenceTypes.find((t) => t.type === evidence.type)
                            ?.label
                        }
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(evidence.createdAt).toLocaleString("es-CO")}
                      </p>
                      {evidence.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {evidence.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    Ver
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {evidences.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="secondary" size="sm">
                Ver todas ({evidences.length})
              </Button>
            </div>
          )}
        </div>
      )}

      {evidences.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 mb-4">
            <svg
              className="w-8 h-8 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Sin Evidencias
          </h3>
          <p className="text-gray-400 mb-4">
            Comienza a documentar tu trabajo agregando evidencias
          </p>
          {status === "IN_PROGRESS" && (
            <Button
              variant="primary"
              onClick={() => handleUploadEvidence("photo")}
            >
              Agregar Primera Evidencia
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
