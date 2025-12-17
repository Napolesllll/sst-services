// components/services/DocumentInstancesManager.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

interface DocumentInstance {
  id: string;
  instanceNumber: number;
  completedAt: string;
  content: any;
  createdAt: string;
}

interface DocumentInstancesManagerProps {
  serviceId: string;
  documentType: string;
  documentLabel: string;
  instances: DocumentInstance[];
  groupDocumentId: string; // Agregado
  onClose: () => void;
  onCreateNew: () => void;
  onViewInstance: (instance: DocumentInstance) => void;
  onDeleteInstance?: (instanceId: string) => Promise<void>;
}

export default function DocumentInstancesManager({
  serviceId,
  documentType,
  documentLabel,
  instances,
  groupDocumentId,
  onClose,
  onCreateNew,
  onViewInstance,
  onDeleteInstance,
}: DocumentInstancesManagerProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);

  const sortedInstances = [...instances].sort(
    (a, b) => b.instanceNumber - a.instanceNumber
  );

  const handleDelete = async (instanceId: string) => {
    if (onDeleteInstance) {
      try {
        setDeleting(true);
        await onDeleteInstance(instanceId);
        setConfirmDelete(null);
      } catch (error) {
        console.error("Error deleting instance:", error);
        alert("Error al eliminar la instancia");
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setGeneratingPDF("consolidado");
      const response = await fetch(
        "/api/services/documents/generate-pdf-from-template",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            groupDocumentId,
            documentType,
            documentLabel,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al generar PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentLabel}_CONSOLIDADO_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error al generar el PDF");
    } finally {
      setGeneratingPDF(null);
    }
  };

  const handleUploadFile = async (instanceId: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".doc,.docx,.pdf";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setUploadingFile(instanceId);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("instanceId", instanceId);
        formData.append("documentType", documentType);

        const response = await fetch("/api/services/documents/upload-file", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Error al subir archivo");
        }

        const result = await response.json();

        // Mostrar mensaje personalizado
        if (result.extractedData) {
          alert(
            `Archivo subido exitosamente!\n\nDatos extraídos del documento:\n${Object.entries(
              result.extractedData
            )
              .slice(0, 3)
              .map(([key, value]) => `• ${key}`)
              .join("\n")}`
          );
        } else {
          alert("Archivo subido exitosamente");
        }

        // Recargar datos
        window.location.reload();
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Error al subir el archivo");
      } finally {
        setUploadingFile(null);
      }
    };
    input.click();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden bg-gray-900 border border-gray-700 rounded-xl shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {documentLabel}
                </h2>
                <p className="text-sm text-white/80">
                  Gestiona las instancias de este documento
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
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
          </div>

          {/* Stats */}
          <div className="p-6 bg-gray-800/50 border-b border-gray-700">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-400">
                  {instances.length}
                </p>
                <p className="text-sm text-gray-400 mt-1">Total de registros</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">
                  {instances.length}
                </p>
                <p className="text-sm text-gray-400 mt-1">Completados</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">
                  {instances.length > 0 ? instances[0]?.instanceNumber || 0 : 0}
                </p>
                <p className="text-sm text-gray-400 mt-1">Última instancia</p>
              </div>
            </div>

            {/* Botón para descargar PDF consolidado */}
            <button
              onClick={() => handleGeneratePDF()}
              disabled={
                generatingPDF === "consolidado" || instances.length === 0
              }
              className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title="Descargar PDF consolidado con todos los registros"
            >
              {generatingPDF === "consolidado" ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <circle cx="10" cy="10" r="8" fill="none" strokeWidth="3" />
                  </svg>
                  Generando PDF...
                </>
              ) : (
                <>
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  📥 Descargar PDF Consolidado ({instances.length} registros)
                </>
              )}
            </button>
          </div>

          {/* Content - Lista de instancias */}
          <div className="overflow-y-auto max-h-[50vh] p-6">
            {sortedInstances.length > 0 ? (
              <div className="space-y-3">
                {sortedInstances.map((instance, index) => (
                  <motion.div
                    key={instance.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-primary-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Número de instancia */}
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-500/20 border-2 border-primary-500">
                          <span className="text-lg font-bold text-primary-400">
                            #{instance.instanceNumber}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white mb-1">
                            {documentLabel} - Registro #
                            {instance.instanceNumber}
                          </h4>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
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
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {new Date(
                                instance.completedAt
                              ).toLocaleDateString("es-CO", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="flex items-center gap-1">
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
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {new Date(
                                instance.completedAt
                              ).toLocaleTimeString("es-CO", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/50 text-xs font-semibold">
                              ✓ Completado
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onViewInstance(instance)}
                          className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                          title="Ver documento"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleUploadFile(instance.id)}
                          disabled={uploadingFile === instance.id}
                          className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors disabled:opacity-50"
                          title="Subir archivo (Word/PDF)"
                        >
                          {uploadingFile === instance.id ? (
                            <svg
                              className="w-5 h-5 animate-spin"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <circle
                                cx="10"
                                cy="10"
                                r="8"
                                fill="none"
                                strokeWidth="3"
                              />
                            </svg>
                          ) : (
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
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          )}
                        </button>

                        {onDeleteInstance && (
                          <>
                            {confirmDelete === instance.id ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleDelete(instance.id)}
                                  disabled={deleting}
                                  className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                                >
                                  {deleting ? "..." : "Confirmar"}
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  disabled={deleting}
                                  className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold transition-colors"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(instance.id)}
                                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                                title="Eliminar"
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                  <svg
                    className="w-8 h-8 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-400 mb-2">
                  Sin registros
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Aún no se han creado instancias de este documento
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 p-6 bg-gray-800/50">
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose} fullWidth>
                Cerrar
              </Button>
              <Button
                variant="primary"
                onClick={onCreateNew}
                fullWidth
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                }
              >
                Crear Nuevo Registro
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
