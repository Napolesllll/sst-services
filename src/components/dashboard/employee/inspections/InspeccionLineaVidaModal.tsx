"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface InspeccionLineaVidaModalProps {
  serviceId: string;
  onClose: () => void;
  onSuccess: () => void;
  existingData?: any;
}

interface CheckItem {
  id: string;
  label: string;
  checked: boolean;
  observations?: string;
}

export default function InspeccionLineaVidaModal({
  serviceId,
  onClose,
  onSuccess,
  existingData,
}: InspeccionLineaVidaModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    marca: existingData?.marca || "",
    modelo: existingData?.modelo || "",
    numeroSerie: existingData?.numeroSerie || "",
    tipoLinea: existingData?.tipoLinea || "",
    longitudCable: existingData?.longitudCable || "",
    capacidadCarga: existingData?.capacidadCarga || "",
    fechaFabricacion: existingData?.fechaFabricacion || "",
    responsableInspeccion: existingData?.responsableInspeccion || "",
  });

  const [checkItems, setCheckItems] = useState<CheckItem[]>(
    existingData?.checkItems || [
      {
        id: "etiqueta",
        label: "Etiqueta con información del fabricante y certificación",
        checked: false,
      },
      {
        id: "carcasa",
        label: "Carcasa sin grietas, deformaciones o daños",
        checked: false,
      },
      {
        id: "cable_cinta",
        label: "Cable o cinta sin deshilachados, cortes o torceduras",
        checked: false,
      },
      {
        id: "mecanismo_bloqueo",
        label: "Mecanismo de bloqueo automático funciona correctamente",
        checked: false,
      },
      {
        id: "retraccion",
        label: "Sistema de retracción opera suavemente",
        checked: false,
      },
      {
        id: "mosqueton",
        label: "Mosquetón y seguro en perfecto estado",
        checked: false,
      },
      {
        id: "indicador_caida",
        label: "Indicador de caídas NO activado",
        checked: false,
      },
      {
        id: "punto_anclaje",
        label: "Punto de anclaje verificado y certificado",
        checked: false,
      },
      {
        id: "limpieza",
        label: "Equipo limpio y libre de contaminantes",
        checked: false,
      },
      {
        id: "prueba_funcionamiento",
        label: "Prueba de funcionamiento realizada exitosamente",
        checked: false,
      },
      {
        id: "certificacion",
        label: "Certificación vigente y dentro de vida útil",
        checked: false,
      },
    ]
  );

  const [observacionesGenerales, setObservacionesGenerales] = useState(
    existingData?.observacionesGenerales || ""
  );

  const tiposLinea = [
    "Retráctil vertical",
    "Retráctil horizontal",
    "Fija temporal",
    "Fija permanente",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleCheckItem = (id: string) => {
    setCheckItems(
      checkItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const updateItemObservation = (id: string, observation: string) => {
    setCheckItems(
      checkItems.map((item) =>
        item.id === id ? { ...item, observations: observation } : item
      )
    );
  };

  const allChecked = checkItems.every((item) => item.checked);
  const passed = allChecked;

  const handleSubmit = async () => {
    if (!formData.marca || !formData.tipoLinea) {
      setError("Completa la información básica del equipo");
      return;
    }

    if (!formData.responsableInspeccion) {
      setError("Ingresa el responsable de la inspección");
      return;
    }

    if (!allChecked) {
      if (
        !confirm(
          "⚠️ ALERTA: Línea de vida NO APTA. Este es un equipo crítico para salvar vidas. ¿Confirmar resultado?"
        )
      ) {
        return;
      }
    }

    try {
      setLoading(true);
      setError("");

      const inspectionData = {
        serviceId,
        inspectionType: "LINEA_VIDA",
        data: {
          ...formData,
          checkItems,
          observacionesGenerales,
        },
        passed,
        observations: observacionesGenerales,
      };

      const response = await fetch("/api/services/inspections/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inspectionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar inspección");
      }

      onSuccess();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  ➰ Inspección de Línea de Vida Retráctil
                </h2>
                <p className="text-gray-400 text-sm">Paso {step} de 3</p>
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

            <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${(step / 3) * 100}%` }}
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Información */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400 font-semibold">
                    ⚠️ EQUIPO CRÍTICO: La línea de vida es el último recurso de
                    protección. Inspección rigurosa obligatoria.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    name="fecha"
                    label="Fecha de Inspección"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    type="text"
                    name="responsableInspeccion"
                    label="Responsable"
                    placeholder="Nombre completo"
                    value={formData.responsableInspeccion}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    type="text"
                    name="marca"
                    label="Marca"
                    placeholder="Ej: 3M, MSA, Capital Safety"
                    value={formData.marca}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    type="text"
                    name="modelo"
                    label="Modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                  />

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Tipo de Línea de Vida *
                    </label>
                    <select
                      name="tipoLinea"
                      value={formData.tipoLinea}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    >
                      <option value="">Seleccionar...</option>
                      {tiposLinea.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    type="text"
                    name="numeroSerie"
                    label="Número de Serie"
                    value={formData.numeroSerie}
                    onChange={handleChange}
                  />

                  <Input
                    type="text"
                    name="longitudCable"
                    label="Longitud del Cable (m)"
                    placeholder="Ej: 20"
                    value={formData.longitudCable}
                    onChange={handleChange}
                  />

                  <Input
                    type="text"
                    name="capacidadCarga"
                    label="Capacidad de Carga (kg)"
                    placeholder="Ej: 140"
                    value={formData.capacidadCarga}
                    onChange={handleChange}
                  />

                  <Input
                    type="date"
                    name="fechaFabricacion"
                    label="Fecha de Fabricación"
                    value={formData.fechaFabricacion}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Checklist */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <p className="text-sm text-orange-400 font-semibold">
                    🔍 Inspección exhaustiva - Tu vida depende de esto
                  </p>
                </div>

                <div className="space-y-3">
                  {checkItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border transition-all ${
                        item.checked
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-gray-800/50 border-gray-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleCheckItem(item.id)}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            item.checked
                              ? "border-green-500 bg-green-500"
                              : "border-gray-600 hover:border-gray-500"
                          }`}
                        >
                          {item.checked && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>

                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium mb-2 ${
                              item.checked ? "text-white" : "text-gray-300"
                            }`}
                          >
                            {item.label}
                          </p>

                          {!item.checked && (
                            <input
                              type="text"
                              placeholder="Detalla el problema..."
                              value={item.observations || ""}
                              onChange={(e) =>
                                updateItemObservation(item.id, e.target.value)
                              }
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-red-500"
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      Verificaciones:{" "}
                      {checkItems.filter((i) => i.checked).length} /{" "}
                      {checkItems.length}
                    </p>
                    {allChecked ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/50">
                        ✓ APTA PARA USO
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/50 animate-pulse">
                        ✗ NO USAR
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Observaciones */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Observaciones y Recomendaciones
                  </label>
                  <textarea
                    value={observacionesGenerales}
                    onChange={(e) => setObservacionesGenerales(e.target.value)}
                    rows={6}
                    placeholder="Registra hallazgos importantes, condiciones especiales, recomendaciones de mantenimiento..."
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                  />
                </div>

                {/* Resumen */}
                <div className="p-5 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="font-semibold text-white mb-4">
                    Resumen Final de Inspección
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Equipo</p>
                      <p className="text-white font-medium">
                        {formData.marca} {formData.modelo}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tipo</p>
                      <p className="text-white font-medium">
                        {formData.tipoLinea}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Longitud</p>
                      <p className="text-white font-medium">
                        {formData.longitudCable} m
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Resultado</p>
                      <p
                        className={`font-bold text-lg ${
                          allChecked ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {allChecked ? "✓ APTA" : "✗ NO APTA"}
                      </p>
                    </div>
                  </div>

                  {!allChecked && (
                    <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                      <p className="text-red-400 text-xs font-semibold">
                        ⚠️ Este equipo NO debe ser utilizado hasta corregir las
                        fallas detectadas
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-400"
              >
                {error}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6">
            <div className="flex gap-3">
              {step > 1 && (
                <Button
                  variant="secondary"
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                >
                  Anterior
                </Button>
              )}
              <Button
                variant="secondary"
                fullWidth
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              {step < 3 ? (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setStep(step + 1)}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSubmit}
                  loading={loading}
                >
                  Guardar Inspección
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
