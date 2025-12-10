"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface InspeccionEscaleraModalProps {
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

export default function InspeccionEscaleraModal({
  serviceId,
  onClose,
  onSuccess,
  existingData,
}: InspeccionEscaleraModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    marca: existingData?.marca || "",
    tipoEscalera: existingData?.tipoEscalera || "",
    material: existingData?.material || "",
    alturaMaxima: existingData?.alturaMaxima || "",
    capacidadCarga: existingData?.capacidadCarga || "",
    numeroInventario: existingData?.numeroInventario || "",
    ubicacion: existingData?.ubicacion || "",
    responsableInspeccion: existingData?.responsableInspeccion || "",
  });

  const [checkItems, setCheckItems] = useState<CheckItem[]>(
    existingData?.checkItems || [
      {
        id: "etiqueta",
        label: "Etiqueta de identificación y capacidad de carga presente",
        checked: false,
      },
      {
        id: "peldanos",
        label: "Peldaños en buen estado, sin grietas ni desgaste",
        checked: false,
      },
      {
        id: "largueros",
        label: "Largueros rectos, sin torceduras ni daños",
        checked: false,
      },
      {
        id: "patas",
        label: "Patas/bases antideslizantes en buen estado",
        checked: false,
      },
      {
        id: "bisagras",
        label: "Bisagras y herrajes funcionan correctamente",
        checked: false,
      },
      {
        id: "estabilidad",
        label: "Escalera estable, sin movimientos anormales",
        checked: false,
      },
      {
        id: "union_peldanos",
        label: "Uniones de peldaños firmes y sin holgura",
        checked: false,
      },
      {
        id: "superficie",
        label: "Superficie antideslizante en peldaños funcional",
        checked: false,
      },
      {
        id: "limpieza",
        label: "Escalera limpia, sin grasa o sustancias resbalosas",
        checked: false,
      },
      {
        id: "corrosion",
        label: "Sin corrosión, oxidación o deterioro del material",
        checked: false,
      },
      {
        id: "seguros",
        label: "Seguros de extensión/tijera funcionan (si aplica)",
        checked: false,
      },
      {
        id: "certificacion",
        label: "Certificación/aprobación para uso industrial vigente",
        checked: false,
      },
      {
        id: "almacenamiento",
        label: "Condiciones de almacenamiento apropiadas",
        checked: false,
      },
    ]
  );

  const [observacionesGenerales, setObservacionesGenerales] = useState(
    existingData?.observacionesGenerales || ""
  );

  const tiposEscalera = [
    "Tijera simple",
    "Tijera doble",
    "Extensible",
    "Recta simple",
    "Multipropósito",
    "Plataforma",
  ];

  const materiales = ["Aluminio", "Fibra de vidrio", "Madera", "Acero"];

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
    if (!formData.tipoEscalera || !formData.material) {
      setError("Completa la información básica de la escalera");
      return;
    }

    if (!formData.responsableInspeccion) {
      setError("Ingresa el responsable de la inspección");
      return;
    }

    if (!allChecked) {
      if (
        !confirm(
          "⚠️ Escalera NO APTA para uso. ¿Confirmar y marcar como no apta?"
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
        inspectionType: "ESCALERA",
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
                  🪜 Inspección de Escalera
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
                className="h-full bg-gradient-to-r from-amber-600 to-orange-600"
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
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-sm text-amber-400">
                    ℹ️ Las escaleras son una de las principales causas de
                    accidentes. Inspección visual rigurosa obligatoria.
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
                    placeholder="Ej: Werner, Louisville, Truper"
                    value={formData.marca}
                    onChange={handleChange}
                  />

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Tipo de Escalera *
                    </label>
                    <select
                      name="tipoEscalera"
                      value={formData.tipoEscalera}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    >
                      <option value="">Seleccionar...</option>
                      {tiposEscalera.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Material *
                    </label>
                    <select
                      name="material"
                      value={formData.material}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    >
                      <option value="">Seleccionar...</option>
                      {materiales.map((mat) => (
                        <option key={mat} value={mat}>
                          {mat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    type="text"
                    name="alturaMaxima"
                    label="Altura Máxima (m)"
                    placeholder="Ej: 3.6"
                    value={formData.alturaMaxima}
                    onChange={handleChange}
                  />

                  <Input
                    type="text"
                    name="capacidadCarga"
                    label="Capacidad de Carga (kg)"
                    placeholder="Ej: 136"
                    value={formData.capacidadCarga}
                    onChange={handleChange}
                  />

                  <Input
                    type="text"
                    name="numeroInventario"
                    label="N° de Inventario"
                    value={formData.numeroInventario}
                    onChange={handleChange}
                  />

                  <Input
                    type="text"
                    name="ubicacion"
                    label="Ubicación/Bodega"
                    placeholder="Dónde se almacena"
                    value={formData.ubicacion}
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
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-400 font-semibold">
                    ⚠️ Inspección detallada - Verifica cada componente
                  </p>
                </div>

                <div className="space-y-3">
                  {checkItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
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
                              placeholder="Describe el problema..."
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

                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      Progreso: {checkItems.filter((i) => i.checked).length} /{" "}
                      {checkItems.length}
                    </p>
                    {allChecked ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/50">
                        ✓ ESCALERA APTA
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/50">
                        ✗ NO APTA
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
                    Observaciones Generales
                  </label>
                  <textarea
                    value={observacionesGenerales}
                    onChange={(e) => setObservacionesGenerales(e.target.value)}
                    rows={5}
                    placeholder="Observaciones sobre el estado general, recomendaciones de mantenimiento, vida útil estimada..."
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                  />
                </div>

                {/* Resumen */}
                <div className="p-5 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="font-semibold text-white mb-4">
                    Resumen de Inspección
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Tipo</p>
                      <p className="text-white font-medium">
                        {formData.tipoEscalera}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Material</p>
                      <p className="text-white font-medium">
                        {formData.material}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Altura Máxima</p>
                      <p className="text-white font-medium">
                        {formData.alturaMaxima} m
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Resultado</p>
                      <p
                        className={`font-bold ${
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
                        ⚠️ Escalera NO apta - Retirar de servicio hasta corregir
                        defectos
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
