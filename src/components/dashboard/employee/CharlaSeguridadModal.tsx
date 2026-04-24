"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface CharlaSeguridadModalProps {
  serviceId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Asistente {
  id: string;
  nombre: string;
  cedula: string;
  cargo: string;
  firma?: string;
}

export default function CharlaSeguridadModal({
  serviceId,
  onClose,
  onSuccess,
}: CharlaSeguridadModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  // Datos del formulario
  const [formData, setFormData] = useState({
    fechaCapacitacion: new Date().toISOString().split("T")[0],
    horaInicio: new Date().toTimeString().slice(0, 5),
    horaFinal: new Date().toTimeString().slice(0, 5),
    tema: "",
    objetivo: "",
  });

  const [asistentes, setAsistentes] = useState<Asistente[]>([]);
  const [nuevoAsistente, setNuevoAsistente] = useState({
    nombre: "",
    cedula: "",
    cargo: "",
    firma: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const agregarAsistente = () => {
    if (
      !nuevoAsistente.nombre ||
      !nuevoAsistente.cedula ||
      !nuevoAsistente.cargo ||
      !nuevoAsistente.firma
    ) {
      setError("Completa todos los campos del asistente");
      return;
    }

    setAsistentes([
      ...asistentes,
      {
        id: Date.now().toString(),
        ...nuevoAsistente,
      },
    ]);

    setNuevoAsistente({
      nombre: "",
      cedula: "",
      cargo: "",
      firma: "",
    });
    setError("");
  };

  const eliminarAsistente = (id: string) => {
    setAsistentes(asistentes.filter((a) => a.id !== id));
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.fechaCapacitacion) {
      setError("La fecha de capacitación es requerida");
      return;
    }

    if (!formData.horaInicio || !formData.horaFinal) {
      setError("Las horas de inicio y final son requeridas");
      return;
    }

    if (!formData.tema) {
      setError("El tema es requerido");
      return;
    }

    if (!formData.objetivo) {
      setError("El objetivo es requerido");
      return;
    }

    if (asistentes.length === 0) {
      setError("Agrega al menos un asistente");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/services/documents/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId,
          documentType: "CHARLA_SEGURIDAD",
          content: {
            ...formData,
            asistentes,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar charla");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl my-auto bg-gray-900 border border-gray-700 rounded-xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  🗣️ Charla de Seguridad
                </h2>
                <p className="text-gray-400 text-sm">Paso {step} de 2</p>
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

            {/* Progress bar */}
            <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "50%" }}
                animate={{ width: `${(step / 2) * 100}%` }}
                className="h-full bg-gradient-to-r from-primary-600 to-secondary-600"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Información General */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Información de la Charla
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    name="fechaCapacitacion"
                    label="Fecha de Capacitación"
                    value={formData.fechaCapacitacion}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    type="time"
                    name="horaInicio"
                    label="Hora Inicio"
                    value={formData.horaInicio}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    type="time"
                    name="horaFinal"
                    label="Hora Final"
                    value={formData.horaFinal}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Tema *
                  </label>
                  <textarea
                    name="tema"
                    value={formData.tema}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Ingresa el tema de la charla..."
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Objetivo *
                  </label>
                  <textarea
                    name="objetivo"
                    value={formData.objetivo}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Ingresa el objetivo de la charla..."
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                    required
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Asistentes */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Agregar Asistentes
                </h3>

                {/* Formulario para agregar asistente */}
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="text-sm font-semibold text-white mb-3">
                    Agregar Asistente
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <Input
                      type="text"
                      placeholder="Nombre"
                      value={nuevoAsistente.nombre}
                      onChange={(e) =>
                        setNuevoAsistente({
                          ...nuevoAsistente,
                          nombre: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="text"
                      placeholder="Cédula"
                      value={nuevoAsistente.cedula}
                      onChange={(e) =>
                        setNuevoAsistente({
                          ...nuevoAsistente,
                          cedula: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="text"
                      placeholder="Cargo"
                      value={nuevoAsistente.cargo}
                      onChange={(e) =>
                        setNuevoAsistente({
                          ...nuevoAsistente,
                          cargo: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="text"
                      placeholder="Firma"
                      value={nuevoAsistente.firma}
                      onChange={(e) =>
                        setNuevoAsistente({
                          ...nuevoAsistente,
                          firma: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={agregarAsistente}
                  >
                    Agregar Asistente
                  </Button>
                </div>

                {/* Lista de asistentes */}
                {asistentes.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-400">
                      Asistentes Registrados ({asistentes.length})
                    </h4>
                    {asistentes.map((asistente) => (
                      <div
                        key={asistente.id}
                        className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 flex items-center justify-between"
                      >
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Nombre</p>
                            <p className="text-white">{asistente.nombre}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Cédula</p>
                            <p className="text-white">{asistente.cedula}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Cargo</p>
                            <p className="text-white">{asistente.cargo}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Firma</p>
                            <p className="text-white">
                              {asistente.firma ? "✓ Presente" : "-"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => eliminarAsistente(asistente.id)}
                          className="ml-4 p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors flex-shrink-0"
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No hay asistentes registrados
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Riesgos y Medidas */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Confirmación
                </h3>
                <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                  <p className="text-white text-sm">
                    ✓ Todos los datos han sido completados correctamente
                  </p>
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
              {step < 2 ? (
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
                  Guardar Charla
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
