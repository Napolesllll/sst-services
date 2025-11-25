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
    fecha: new Date().toISOString().split("T")[0],
    hora: new Date().toTimeString().slice(0, 5),
    lugar: "",
    responsable: "",
    duracion: "30",
    temas: [] as string[],
    riesgosIdentificados: [] as string[],
    medidasControl: [] as string[],
    observaciones: "",
  });

  const [asistentes, setAsistentes] = useState<Asistente[]>([]);
  const [nuevoAsistente, setNuevoAsistente] = useState({
    nombre: "",
    cedula: "",
    cargo: "",
  });

  // Temas predefinidos
  const temasDisponibles = [
    "Uso correcto de EPP",
    "Trabajo en alturas",
    "Espacios confinados",
    "Manejo de herramientas",
    "Orden y aseo",
    "Prevención de caídas",
    "Riesgos eléctricos",
    "Manipulación de cargas",
    "Primeros auxilios",
    "Plan de emergencia",
    "Señalización",
    "Riesgos químicos",
  ];

  const riesgosComunes = [
    "Caída de altura",
    "Golpes y contusiones",
    "Atrapamiento",
    "Contacto eléctrico",
    "Exposición a químicos",
    "Sobreesfuerzo",
    "Proyección de partículas",
    "Ruido",
    "Temperaturas extremas",
    "Cortes y heridas",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleTema = (tema: string) => {
    setFormData({
      ...formData,
      temas: formData.temas.includes(tema)
        ? formData.temas.filter((t) => t !== tema)
        : [...formData.temas, tema],
    });
  };

  const toggleRiesgo = (riesgo: string) => {
    setFormData({
      ...formData,
      riesgosIdentificados: formData.riesgosIdentificados.includes(riesgo)
        ? formData.riesgosIdentificados.filter((r) => r !== riesgo)
        : [...formData.riesgosIdentificados, riesgo],
    });
  };

  const agregarAsistente = () => {
    if (
      !nuevoAsistente.nombre ||
      !nuevoAsistente.cedula ||
      !nuevoAsistente.cargo
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
    });
    setError("");
  };

  const eliminarAsistente = (id: string) => {
    setAsistentes(asistentes.filter((a) => a.id !== id));
  };

  const agregarMedidaControl = () => {
    const medida = prompt("Ingresa la medida de control:");
    if (medida && medida.trim()) {
      setFormData({
        ...formData,
        medidasControl: [...formData.medidasControl, medida.trim()],
      });
    }
  };

  const eliminarMedidaControl = (index: number) => {
    setFormData({
      ...formData,
      medidasControl: formData.medidasControl.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.lugar) {
      setError("El lugar es requerido");
      return;
    }

    if (!formData.responsable) {
      setError("El responsable es requerido");
      return;
    }

    if (formData.temas.length === 0) {
      setError("Selecciona al menos un tema");
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  🗣️ Charla de Seguridad
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

            {/* Progress bar */}
            <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "33%" }}
                animate={{ width: `${(step / 3) * 100}%` }}
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
                  Información General
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    name="fecha"
                    label="Fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    type="time"
                    name="hora"
                    label="Hora"
                    value={formData.hora}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    type="text"
                    name="lugar"
                    label="Lugar"
                    placeholder="Ej: Obra Calle 123"
                    value={formData.lugar}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    type="text"
                    name="responsable"
                    label="Responsable"
                    placeholder="Nombre del responsable"
                    value={formData.responsable}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    type="number"
                    name="duracion"
                    label="Duración (minutos)"
                    value={formData.duracion}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Temas Tratados *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {temasDisponibles.map((tema) => (
                      <button
                        key={tema}
                        type="button"
                        onClick={() => toggleTema(tema)}
                        className={`p-3 rounded-lg border transition-all text-left text-sm ${
                          formData.temas.includes(tema)
                            ? "bg-primary-500/20 border-primary-500 text-white"
                            : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        {tema}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.temas.length} tema(s) seleccionado(s)
                  </p>
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
                  Asistentes
                </h3>

                {/* Formulario para agregar asistente */}
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="text-sm font-semibold text-white mb-3">
                    Agregar Asistente
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      type="text"
                      placeholder="Nombre completo"
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
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-3"
                    onClick={agregarAsistente}
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
                        <div className="flex-1 grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Nombre</p>
                            <p className="text-sm text-white">
                              {asistente.nombre}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Cédula</p>
                            <p className="text-sm text-white">
                              {asistente.cedula}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Cargo</p>
                            <p className="text-sm text-white">
                              {asistente.cargo}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => eliminarAsistente(asistente.id)}
                          className="ml-4 p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
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
                  Riesgos y Medidas de Control
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Riesgos Identificados
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {riesgosComunes.map((riesgo) => (
                      <button
                        key={riesgo}
                        type="button"
                        onClick={() => toggleRiesgo(riesgo)}
                        className={`p-3 rounded-lg border transition-all text-left text-sm ${
                          formData.riesgosIdentificados.includes(riesgo)
                            ? "bg-yellow-500/20 border-yellow-500 text-white"
                            : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        {riesgo}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-300">
                      Medidas de Control
                    </label>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={agregarMedidaControl}
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
                  </div>
                  {formData.medidasControl.length > 0 ? (
                    <ul className="space-y-2">
                      {formData.medidasControl.map((medida, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                        >
                          <span className="text-sm text-white">{medida}</span>
                          <button
                            onClick={() => eliminarMedidaControl(index)}
                            className="text-red-400 hover:text-red-300"
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No hay medidas de control agregadas
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Observaciones adicionales..."
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                  />
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
