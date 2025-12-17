"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DocumentTemplatesManager from "@/components/dashboard/admin/DocumentTemplatesManager";

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

// Tipos de servicio
const SERVICE_TYPES = [
  { value: "PROFESIONAL_SST", label: "Profesional SST" },
  { value: "TECNOLOGO_SST", label: "Tecnólogo SST" },
  { value: "TECNICO_SST", label: "Técnico SST" },
  { value: "COORDINADOR_ALTURAS", label: "Coordinador de Alturas" },
  {
    value: "SUPERVISOR_ESPACIOS_CONFINADOS",
    label: "Supervisor Espacios Confinados",
  },
  { value: "ANDAMIERO", label: "Andamiero" },
  { value: "RESCATISTA", label: "Rescatista" },
  { value: "CAPACITACIONES_CURSOS", label: "Capacitaciones o Cursos" },
  { value: "ALQUILER_EQUIPOS", label: "Alquiler de Equipos" },
  { value: "AUDITORIA_SG_SST", label: "Auditoría SG-SST" },
  { value: "TAPH_PARAMEDICO", label: "TAPH (Paramédico)" },
  { value: "AUXILIAR_OPERATIVO", label: "Auxiliar Operativo" },
];

interface ServiceConfig {
  serviceType: string;
  requiredDocs: string[];
  requiredInspections: string[];
  description: string;
  active: boolean;
}

export default function ConfigurationPage() {
  const [configs, setConfigs] = useState<ServiceConfig[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<ServiceConfig | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"config" | "templates">("config");

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/configuration/service-types");
      const data = await response.json();

      if (response.ok) {
        setConfigs(data.configurations || []);
      }
    } catch (err) {
      console.error("Error fetching configurations:", err);
      setError("Error al cargar configuraciones");
    } finally {
      setLoading(false);
    }
  };

  const handleEditConfig = (serviceType: string) => {
    const existingConfig = configs.find((c) => c.serviceType === serviceType);

    if (existingConfig) {
      setEditingConfig(existingConfig);
    } else {
      // Crear nueva configuración
      setEditingConfig({
        serviceType,
        requiredDocs: [],
        requiredInspections: [],
        description: "",
        active: true,
      });
    }

    setSelectedService(serviceType);
    setShowModal(true);
  };

  const toggleDocument = (docType: string) => {
    if (!editingConfig) return;

    setEditingConfig({
      ...editingConfig,
      requiredDocs: editingConfig.requiredDocs.includes(docType)
        ? editingConfig.requiredDocs.filter((d) => d !== docType)
        : [...editingConfig.requiredDocs, docType],
    });
  };

  const toggleInspection = (inspType: string) => {
    if (!editingConfig) return;

    setEditingConfig({
      ...editingConfig,
      requiredInspections: editingConfig.requiredInspections.includes(inspType)
        ? editingConfig.requiredInspections.filter((i) => i !== inspType)
        : [...editingConfig.requiredInspections, inspType],
    });
  };

  const handleSave = async () => {
    if (!editingConfig) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/configuration/service-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingConfig),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar configuración");
      }

      setSuccess("Configuración guardada exitosamente");
      setShowModal(false);
      fetchConfigurations();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getServiceConfig = (serviceType: string) => {
    return configs.find((c) => c.serviceType === serviceType);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Configuración SG-SST
        </h1>
        <p className="text-gray-400">
          Configura documentos obligatorios e inspecciones por tipo de servicio
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab("config")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "config"
              ? "text-primary-500 border-b-2 border-primary-500"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Configuración por Servicio
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === "templates"
              ? "text-primary-500 border-b-2 border-primary-500"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Plantillas de Documentos
        </button>
      </div>

      {/* Contenido de pestañas */}
      {activeTab === "config" ? (
        <div className="space-y-6">
          {/* Mensajes de éxito/error */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-green-500/20 border border-green-500 text-green-400"
            >
              <div className="flex items-center gap-2">
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
                {success}
              </div>
            </motion.div>
          )}

          {/* Grid de tipos de servicio */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICE_TYPES.map((service, index) => {
              const config = getServiceConfig(service.value);
              const hasConfig = !!config;

              return (
                <motion.div
                  key={service.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card variant="cyber" hover>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          {service.label}
                        </h3>
                        {hasConfig ? (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-400">
                              📄 {config.requiredDocs.length} documento(s)
                            </p>
                            <p className="text-xs text-gray-400">
                              🔍 {config.requiredInspections.length}{" "}
                              inspección(es)
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">
                            Sin configurar
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          hasConfig
                            ? "bg-green-500/20 text-green-400 border border-green-500/50"
                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50"
                        }`}
                      >
                        {hasConfig ? "✓" : "⚠"}
                      </span>
                    </div>

                    <Button
                      variant={hasConfig ? "secondary" : "primary"}
                      size="sm"
                      fullWidth
                      onClick={() => handleEditConfig(service.value)}
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
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      }
                    >
                      {hasConfig ? "Editar" : "Configurar"}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Modal de configuración */}
          <AnimatePresence>
            {showModal && editingConfig && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowModal(false)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl shadow-2xl"
                >
                  {/* Header */}
                  <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                          Configurar Servicio
                        </h2>
                        <p className="text-gray-400">
                          {
                            SERVICE_TYPES.find(
                              (s) => s.value === editingConfig.serviceType
                            )?.label
                          }
                        </p>
                      </div>
                      <button
                        onClick={() => setShowModal(false)}
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
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Descripción */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Descripción (Opcional)
                      </label>
                      <textarea
                        value={editingConfig.description}
                        onChange={(e) =>
                          setEditingConfig({
                            ...editingConfig,
                            description: e.target.value,
                          })
                        }
                        rows={2}
                        placeholder="Descripción o notas sobre este tipo de servicio..."
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                      />
                    </div>

                    {/* Documentos obligatorios */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span>📄</span>
                        Documentos Obligatorios
                        <span className="text-sm font-normal text-gray-500">
                          ({editingConfig.requiredDocs.length} seleccionado
                          {editingConfig.requiredDocs.length !== 1 ? "s" : ""})
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {DOCUMENT_TYPES.map((doc) => (
                          <button
                            key={doc.value}
                            onClick={() => toggleDocument(doc.value)}
                            className={`p-4 rounded-lg border transition-all text-left ${
                              editingConfig.requiredDocs.includes(doc.value)
                                ? "bg-primary-500/20 border-primary-500 shadow-neon"
                                : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{doc.icon}</span>
                              <div className="flex-1">
                                <p
                                  className={`text-sm font-medium ${
                                    editingConfig.requiredDocs.includes(
                                      doc.value
                                    )
                                      ? "text-white"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {doc.label}
                                </p>
                              </div>
                              {editingConfig.requiredDocs.includes(
                                doc.value
                              ) && (
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
                        Inspecciones Obligatorias
                        <span className="text-sm font-normal text-gray-500">
                          ({editingConfig.requiredInspections.length}{" "}
                          seleccionada
                          {editingConfig.requiredInspections.length !== 1
                            ? "s"
                            : ""}
                          )
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {INSPECTION_TYPES.map((insp) => (
                          <button
                            key={insp.value}
                            onClick={() => toggleInspection(insp.value)}
                            className={`p-3 rounded-lg border transition-all text-left ${
                              editingConfig.requiredInspections.includes(
                                insp.value
                              )
                                ? "bg-secondary-500/20 border-secondary-500"
                                : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{insp.icon}</span>
                              <div className="flex-1">
                                <p
                                  className={`text-xs font-medium ${
                                    editingConfig.requiredInspections.includes(
                                      insp.value
                                    )
                                      ? "text-white"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {insp.label}
                                </p>
                              </div>
                              {editingConfig.requiredInspections.includes(
                                insp.value
                              ) && (
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

                    {/* Estado activo */}
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div>
                        <p className="text-white font-medium">
                          Estado de la configuración
                        </p>
                        <p className="text-sm text-gray-400">
                          Activar o desactivar esta configuración
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setEditingConfig({
                            ...editingConfig,
                            active: !editingConfig.active,
                          })
                        }
                        className={`relative w-14 h-8 rounded-full transition-colors ${
                          editingConfig.active ? "bg-green-500" : "bg-gray-600"
                        }`}
                      >
                        <motion.div
                          animate={{ x: editingConfig.active ? 24 : 2 }}
                          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                        />
                      </button>
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
                        onClick={() => setShowModal(false)}
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
            )}
          </AnimatePresence>
        </div>
      ) : (
        <DocumentTemplatesManager />
      )}
    </div>
  );
}
