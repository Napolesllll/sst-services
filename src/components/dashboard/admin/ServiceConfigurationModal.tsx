"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

// Tipos de documentos disponibles
const DOCUMENT_TYPES = [
  { value: "CHARLA_SEGURIDAD", label: "Charla de Seguridad", icon: "🗣️" },
  { value: "ATS", label: "Análisis de Trabajo Seguro (ATS)", icon: "📊" },
  { value: "PERMISO_TRABAJO", label: "Permiso de Trabajo", icon: "✅" },
  {
    value: "PERMISO_ALTURAS",
    label: "Permiso de Trabajo en Alturas",
    icon: "⬆️",
  },
  {
    value: "PERMISO_ESPACIOS_CONFINADOS",
    label: "Permiso de Espacios Confinados",
    icon: "🚪",
  },
  {
    value: "PERMISO_TRABAJO_CALIENTE",
    label: "Permiso de Trabajo en Caliente",
    icon: "🔥",
  },
  {
    value: "PERMISO_ENERGIAS_PELIGROSAS",
    label: "Permiso de Energías Peligrosas (LOTO)",
    icon: "⚡",
  },
];

// Tipos de inspección disponibles
const INSPECTION_TYPES = [
  { value: "ARNES", label: "Inspección de Arnés", icon: "🦺" },
  { value: "ESLINGA", label: "Inspección de Eslinga", icon: "🔗" },
  { value: "ESCALERA", label: "Inspección de Escalera", icon: "🪜" },
  { value: "ANDAMIO", label: "Inspección de Andamio", icon: "🏗️" },
  { value: "HERRAMIENTA_TALADRO", label: "Inspección de Taladro", icon: "🔧" },
  {
    value: "HERRAMIENTA_PULIDORA",
    label: "Inspección de Pulidora",
    icon: "⚙️",
  },
  { value: "MEDICION_GASES", label: "Medición de Gases", icon: "💨" },
  { value: "TRIPODE", label: "Inspección de Trípode", icon: "📐" },
  { value: "LINEA_VIDA", label: "Inspección de Línea de Vida", icon: "🪢" },
  { value: "VENTILACION", label: "Sistema de Ventilación", icon: "💨" },
  { value: "EQUIPO_RESCATE", label: "Equipo de Rescate", icon: "🚑" },
];

interface ServiceConfigurationModalProps {
  serviceId: string;
  serviceName: string;
  serviceType: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  suggestedDocs?: string[];
  suggestedInspections?: string[];
}

export default function ServiceConfigurationModal({
  serviceId,
  serviceName,
  serviceType,
  isOpen,
  onClose,
  onSuccess,
  suggestedDocs = [],
  suggestedInspections = [],
}: ServiceConfigurationModalProps) {
  const [requiredDocs, setRequiredDocs] = useState<string[]>(suggestedDocs);
  const [requiredInspections, setRequiredInspections] =
    useState<string[]>(suggestedInspections);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [usedSuggestion, setUsedSuggestion] = useState(
    suggestedDocs.length > 0 || suggestedInspections.length > 0
  );

  const toggleDocument = (docType: string) => {
    setRequiredDocs((prev) =>
      prev.includes(docType)
        ? prev.filter((d) => d !== docType)
        : [...prev, docType]
    );
  };

  const toggleInspection = (inspType: string) => {
    setRequiredInspections((prev) =>
      prev.includes(inspType)
        ? prev.filter((i) => i !== inspType)
        : [...prev, inspType]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(`/api/services/${serviceId}/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requiredDocs,
          requiredInspections,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar configuración");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Configurar Servicio
                </h2>
                <p className="text-gray-400">
                  Selecciona documentos e inspecciones requeridas para{" "}
                  <span className="text-blue-400 font-semibold">
                    {serviceName}
                  </span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Sugerencia Inteligente */}
            {usedSuggestion &&
              (suggestedDocs.length > 0 || suggestedInspections.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/50 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <svg
                      className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"
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
                      <p className="text-sm font-semibold text-amber-400">
                        ✨ Configuración Sugerida
                      </p>
                      <p className="text-xs text-amber-200 mt-1">
                        Se pre-cargaron los documentos e inspecciones basadas en
                        la configuración global para{" "}
                        <span className="font-medium">{serviceType}</span>.
                        Puedes ajustarlos según las necesidades específicas.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setRequiredDocs([]);
                      setRequiredInspections([]);
                      setUsedSuggestion(false);
                    }}
                    className="text-xs px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 transition-colors flex-shrink-0 whitespace-nowrap"
                  >
                    Limpiar
                  </button>
                </motion.div>
              )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Notas */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Notas Adicionales (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Agrega notas o instrucciones especiales para este servicio..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
              />
            </div>

            {/* Documentos obligatorios */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📄</span>
                Documentos Requeridos
                <span className="text-sm font-normal text-gray-500">
                  ({requiredDocs.length} seleccionado
                  {requiredDocs.length !== 1 ? "s" : ""})
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DOCUMENT_TYPES.map((doc) => (
                  <button
                    key={doc.value}
                    onClick={() => toggleDocument(doc.value)}
                    className={`p-4 rounded-lg border transition-all text-left ${
                      requiredDocs.includes(doc.value)
                        ? "bg-primary-500/20 border-primary-500 shadow-neon"
                        : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{doc.icon}</span>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            requiredDocs.includes(doc.value)
                              ? "text-white"
                              : "text-gray-300"
                          }`}
                        >
                          {doc.label}
                        </p>
                      </div>
                      {requiredDocs.includes(doc.value) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-primary-400"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Inspecciones obligatorias */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>🔍</span>
                Inspecciones Requeridas
                <span className="text-sm font-normal text-gray-500">
                  ({requiredInspections.length} seleccionada
                  {requiredInspections.length !== 1 ? "s" : ""})
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {INSPECTION_TYPES.map((insp) => (
                  <button
                    key={insp.value}
                    onClick={() => toggleInspection(insp.value)}
                    className={`p-3 rounded-lg border transition-all text-left ${
                      requiredInspections.includes(insp.value)
                        ? "bg-secondary-500/20 border-secondary-500"
                        : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{insp.icon}</span>
                      <div className="flex-1">
                        <p
                          className={`text-xs font-medium ${
                            requiredInspections.includes(insp.value)
                              ? "text-white"
                              : "text-gray-300"
                          }`}
                        >
                          {insp.label}
                        </p>
                      </div>
                      {requiredInspections.includes(insp.value) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-secondary-400"
                        >
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-400"
              >
                {error}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6">
            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleSave}
                loading={saving}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                }
              >
                Guardar Configuración
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
