"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface InspeccionArnesModalProps {
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

export default function InspeccionArnesModal({
  serviceId,
  onClose,
  onSuccess,
  existingData,
}: InspeccionArnesModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    marca: existingData?.marca || "",
    modelo: existingData?.modelo || "",
    numeroSerie: existingData?.numeroSerie || "",
    fechaFabricacion: existingData?.fechaFabricacion || "",
    fechaUltimaInspeccion: existingData?.fechaUltimaInspeccion || "",
    responsableInspeccion: existingData?.responsableInspeccion || "",
  });

  const [checkItems, setCheckItems] = useState<CheckItem[]>(
    existingData?.checkItems || [
      {
        id: "etiqueta",
        label: "Etiqueta de identificación legible y presente",
        checked: false,
      },
      {
        id: "costuras",
        label: "Costuras en buen estado, sin deshilachados",
        checked: false,
      },
      {
        id: "cintas",
        label: "Cintas sin cortes, abrasión o desgaste excesivo",
        checked: false,
      },
      {
        id: "argolla_d",
        label: "Argolla D dorsal sin deformaciones ni corrosión",
        checked: false,
      },
      {
        id: "argollas_laterales",
        label: "Argollas laterales en buen estado",
        checked: false,
      },
      {
        id: "hebillas",
        label: "Hebillas funcionan correctamente y sin deformación",
        checked: false,
      },
      {
        id: "cinturon",
        label: "Cinturón sin grietas ni roturas",
        checked: false,
      },
      {
        id: "correas_piernas",
        label: "Correas de piernas ajustan correctamente",
        checked: false,
      },
      {
        id: "correas_hombros",
        label: "Correas de hombros sin daños",
        checked: false,
      },
      {
        id: "limpieza",
        label: "Arnés limpio y libre de contaminantes",
        checked: false,
      },
      {
        id: "ausencia_reparaciones",
        label: "Sin reparaciones o modificaciones no autorizadas",
        checked: false,
      },
      {
        id: "certificacion",
        label: "Certificación vigente (dentro de vida útil)",
        checked: false,
      },
    ]
  );

  const [observacionesGenerales, setObservacionesGenerales] = useState(
    existingData?.observacionesGenerales || ""
  );
  const [photoUrl, setPhotoUrl] = useState(existingData?.photoUrl || "");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
    // Validaciones
    if (!formData.marca || !formData.modelo || !formData.numeroSerie) {
      setError("Completa la información básica del arnés");
      return;
    }

    if (!formData.responsableInspeccion) {
      setError("Ingresa el nombre del responsable de la inspección");
      return;
    }

    if (!allChecked) {
      if (
        !confirm(
          "⚠️ NO todos los ítems están aprobados. ¿Deseas marcar este arnés como NO APTO?"
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
        inspectionType: "ARNES",
        data: {
          ...formData,
          checkItems,
          observacionesGenerales,
          photoUrl,
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
                  🦺 Inspección de Arnés de Cuerpo Completo
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
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-600"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Información del Arnés */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-400">
                    ℹ️ Registra la información básica del arnés antes de
                    realizar la inspección visual
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
                    label="Responsable de Inspección"
                    placeholder="Nombre completo"
                    value={formData.responsableInspeccion}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    type="text"
                    name="marca"
                    label="Marca del Arnés"
                    placeholder="Ej: 3M, MSA, Honeywell"
                    value={formData.marca}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    type="text"
                    name="modelo"
                    label="Modelo"
                    placeholder="Modelo del arnés"
                    value={formData.modelo}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    type="text"
                    name="numeroSerie"
                    label="Número de Serie"
                    placeholder="N° de serie"
                    value={formData.numeroSerie}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    type="date"
                    name="fechaFabricacion"
                    label="Fecha de Fabricación"
                    value={formData.fechaFabricacion}
                    onChange={handleChange}
                  />

                  <Input
                    type="date"
                    name="fechaUltimaInspeccion"
                    label="Última Inspección"
                    value={formData.fechaUltimaInspeccion}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Checklist de Inspección */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-400 font-semibold">
                    ⚠️ CRÍTICO: Todos los ítems deben estar ✓ para que el arnés
                    sea APTO
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
                              placeholder="Si no cumple, explica por qué..."
                              value={item.observations || ""}
                              onChange={(e) =>
                                updateItemObservation(item.id, e.target.value)
                              }
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Contador */}
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      Ítems Aprobados:{" "}
                      {checkItems.filter((i) => i.checked).length} /{" "}
                      {checkItems.length}
                    </p>
                    {allChecked ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/50">
                        ✓ APTO PARA USO
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/50">
                        ✗ NO APTO
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Observaciones y Foto */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Observaciones Generales
                  </label>
                  <textarea
                    value={observacionesGenerales}
                    onChange={(e) => setObservacionesGenerales(e.target.value)}
                    rows={4}
                    placeholder="Observaciones adicionales sobre el estado del arnés..."
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Foto del Arnés (Opcional)
                  </label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-primary-500 transition-all cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="photo-upload"
                      onChange={(e) => {
                        // Aquí iría la lógica de carga de foto
                        console.log(e.target.files);
                      }}
                    />
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <svg
                        className="w-12 h-12 text-gray-400 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-gray-400 text-sm">
                        Click para tomar/subir foto
                      </span>
                    </label>
                  </div>
                </div>

                {/* Resumen Final */}
                <div className="p-5 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="font-semibold text-white mb-4">
                    Resumen de Inspección
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Arnés</p>
                      <p className="text-white font-medium">
                        {formData.marca} {formData.modelo}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">N° Serie</p>
                      <p className="text-white font-medium">
                        {formData.numeroSerie}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Responsable</p>
                      <p className="text-white font-medium">
                        {formData.responsableInspeccion}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Resultado</p>
                      <p
                        className={`font-bold ${
                          allChecked ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {allChecked ? "✓ APTO" : "✗ NO APTO"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
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
