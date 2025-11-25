"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface ATSModalProps {
  serviceId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface PasoTrabajo {
  id: string;
  descripcion: string;
  riesgos: Riesgo[];
}

interface Riesgo {
  id: string;
  descripcion: string;
  nivelRiesgo: "BAJO" | "MEDIO" | "ALTO" | "CRITICO";
  controles: string[];
}

export default function ATSModal({
  serviceId,
  onClose,
  onSuccess,
}: ATSModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  // Datos del formulario
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    lugar: "",
    trabajoRealizar: "",
    responsable: "",
    personal: [] as string[],
    eppRequerido: [] as string[],
    herramientas: [] as string[],
  });

  const [pasosTrabajo, setPasosTrabajo] = useState<PasoTrabajo[]>([]);
  const [nuevoPaso, setNuevoPaso] = useState("");
  const [pasoActual, setPasoActual] = useState<string | null>(null);
  const [nuevoRiesgo, setNuevoRiesgo] = useState({
    descripcion: "",
    nivelRiesgo: "MEDIO" as "BAJO" | "MEDIO" | "ALTO" | "CRITICO",
  });

  // EPP y herramientas predefinidas
  const eppDisponible = [
    "Casco",
    "Gafas de seguridad",
    "Protección auditiva",
    "Guantes",
    "Botas de seguridad",
    "Arnés de seguridad",
    "Chaleco reflectivo",
    "Mascarilla",
    "Protección respiratoria",
    "Careta facial",
  ];

  const herramientasDisponibles = [
    "Taladro",
    "Pulidora",
    "Martillo",
    "Destornilladores",
    "Alicates",
    "Escalera",
    "Andamio",
    "Multímetro",
    "Sierra",
    "Llave inglesa",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleEPP = (epp: string) => {
    setFormData({
      ...formData,
      eppRequerido: formData.eppRequerido.includes(epp)
        ? formData.eppRequerido.filter((e) => e !== epp)
        : [...formData.eppRequerido, epp],
    });
  };

  const toggleHerramienta = (herramienta: string) => {
    setFormData({
      ...formData,
      herramientas: formData.herramientas.includes(herramienta)
        ? formData.herramientas.filter((h) => h !== herramienta)
        : [...formData.herramientas, herramienta],
    });
  };

  const agregarPersonal = () => {
    const nombre = prompt("Nombre del trabajador:");
    if (nombre && nombre.trim()) {
      setFormData({
        ...formData,
        personal: [...formData.personal, nombre.trim()],
      });
    }
  };

  const eliminarPersonal = (index: number) => {
    setFormData({
      ...formData,
      personal: formData.personal.filter((_, i) => i !== index),
    });
  };

  const agregarPaso = () => {
    if (!nuevoPaso.trim()) {
      setError("Describe el paso de trabajo");
      return;
    }

    setPasosTrabajo([
      ...pasosTrabajo,
      {
        id: Date.now().toString(),
        descripcion: nuevoPaso.trim(),
        riesgos: [],
      },
    ]);
    setNuevoPaso("");
    setError("");
  };

  const eliminarPaso = (id: string) => {
    setPasosTrabajo(pasosTrabajo.filter((p) => p.id !== id));
    if (pasoActual === id) {
      setPasoActual(null);
    }
  };

  const agregarRiesgo = () => {
    if (!pasoActual) {
      setError("Selecciona un paso de trabajo primero");
      return;
    }

    if (!nuevoRiesgo.descripcion.trim()) {
      setError("Describe el riesgo");
      return;
    }

    setPasosTrabajo(
      pasosTrabajo.map((paso) => {
        if (paso.id === pasoActual) {
          return {
            ...paso,
            riesgos: [
              ...paso.riesgos,
              {
                id: Date.now().toString(),
                descripcion: nuevoRiesgo.descripcion.trim(),
                nivelRiesgo: nuevoRiesgo.nivelRiesgo,
                controles: [],
              },
            ],
          };
        }
        return paso;
      })
    );

    setNuevoRiesgo({
      descripcion: "",
      nivelRiesgo: "MEDIO",
    });
    setError("");
  };

  const agregarControl = (pasoId: string, riesgoId: string) => {
    const control = prompt("Ingresa la medida de control:");
    if (control && control.trim()) {
      setPasosTrabajo(
        pasosTrabajo.map((paso) => {
          if (paso.id === pasoId) {
            return {
              ...paso,
              riesgos: paso.riesgos.map((riesgo) => {
                if (riesgo.id === riesgoId) {
                  return {
                    ...riesgo,
                    controles: [...riesgo.controles, control.trim()],
                  };
                }
                return riesgo;
              }),
            };
          }
          return paso;
        })
      );
    }
  };

  const eliminarRiesgo = (pasoId: string, riesgoId: string) => {
    setPasosTrabajo(
      pasosTrabajo.map((paso) => {
        if (paso.id === pasoId) {
          return {
            ...paso,
            riesgos: paso.riesgos.filter((r) => r.id !== riesgoId),
          };
        }
        return paso;
      })
    );
  };

  const getNivelRiesgoColor = (nivel: string) => {
    const colors = {
      BAJO: "bg-green-500/20 text-green-400 border-green-500/50",
      MEDIO: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      ALTO: "bg-orange-500/20 text-orange-400 border-orange-500/50",
      CRITICO: "bg-red-500/20 text-red-400 border-red-500/50",
    };
    return colors[nivel as keyof typeof colors] || colors.MEDIO;
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.trabajoRealizar.trim()) {
      setError("El trabajo a realizar es requerido");
      return;
    }

    if (!formData.responsable.trim()) {
      setError("El responsable es requerido");
      return;
    }

    if (pasosTrabajo.length === 0) {
      setError("Agrega al menos un paso de trabajo");
      return;
    }

    if (formData.eppRequerido.length === 0) {
      setError("Selecciona al menos un EPP requerido");
      return;
    }

    // Verificar que cada paso tenga al menos un riesgo
    const pasosSinRiesgo = pasosTrabajo.filter((p) => p.riesgos.length === 0);
    if (pasosSinRiesgo.length > 0) {
      setError("Todos los pasos deben tener al menos un riesgo identificado");
      return;
    }

    // Verificar que cada riesgo tenga al menos un control
    for (const paso of pasosTrabajo) {
      const riesgosSinControl = paso.riesgos.filter(
        (r) => r.controles.length === 0
      );
      if (riesgosSinControl.length > 0) {
        setError(
          "Todos los riesgos deben tener al menos una medida de control"
        );
        return;
      }
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
          documentType: "ATS",
          content: {
            ...formData,
            pasosTrabajo,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar ATS");
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
          className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  📊 ATS - Análisis de Trabajo Seguro
                </h2>
                <p className="text-gray-400 text-sm">Paso {step} de 4</p>
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
                animate={{ width: `${(step / 4) * 100}%` }}
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
                    type="text"
                    name="lugar"
                    label="Lugar"
                    placeholder="Ubicación del trabajo"
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
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Trabajo a Realizar *
                  </label>
                  <textarea
                    name="trabajoRealizar"
                    value={formData.trabajoRealizar}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe detalladamente el trabajo a realizar..."
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-300">
                      Personal Involucrado
                    </label>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={agregarPersonal}
                    >
                      + Agregar
                    </Button>
                  </div>
                  {formData.personal.length > 0 ? (
                    <ul className="space-y-2">
                      {formData.personal.map((nombre, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                        >
                          <span className="text-sm text-white">{nombre}</span>
                          <button
                            onClick={() => eliminarPersonal(index)}
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
                      No hay personal agregado
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Pasos de Trabajo */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Pasos del Trabajo
                </h3>

                {/* Agregar paso */}
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="text-sm font-semibold text-white mb-3">
                    Agregar Paso
                  </h4>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Ej: Preparar el área de trabajo"
                      value={nuevoPaso}
                      onChange={(e) => setNuevoPaso(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && agregarPaso()}
                      className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                    />
                    <Button variant="primary" onClick={agregarPaso}>
                      Agregar
                    </Button>
                  </div>
                </div>

                {/* Lista de pasos */}
                {pasosTrabajo.length > 0 ? (
                  <div className="space-y-3">
                    {pasosTrabajo.map((paso, index) => (
                      <div
                        key={paso.id}
                        className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs font-bold rounded">
                                #{index + 1}
                              </span>
                              <p className="text-white font-medium">
                                {paso.descripcion}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500">
                              {paso.riesgos.length} riesgo(s) identificado(s)
                            </p>
                          </div>
                          <button
                            onClick={() => eliminarPaso(paso.id)}
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No hay pasos agregados</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Riesgos y Controles */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Riesgos y Controles por Paso
                </h3>

                {/* Selector de paso */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Selecciona un Paso de Trabajo
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {pasosTrabajo.map((paso, index) => (
                      <button
                        key={paso.id}
                        onClick={() => setPasoActual(paso.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          pasoActual === paso.id
                            ? "bg-primary-500/20 border-primary-500 text-white"
                            : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">
                            #{index + 1}
                          </span>
                          <span className="text-sm">{paso.descripcion}</span>
                          <span className="ml-auto text-xs text-gray-500">
                            {paso.riesgos.length} riesgo(s)
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Agregar riesgo al paso seleccionado */}
                {pasoActual && (
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-semibold text-white mb-3">
                      Agregar Riesgo
                    </h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Describe el riesgo..."
                        value={nuevoRiesgo.descripcion}
                        onChange={(e) =>
                          setNuevoRiesgo({
                            ...nuevoRiesgo,
                            descripcion: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                      />
                      <div className="flex gap-2">
                        {(["BAJO", "MEDIO", "ALTO", "CRITICO"] as const).map(
                          (nivel) => (
                            <button
                              key={nivel}
                              onClick={() =>
                                setNuevoRiesgo({
                                  ...nuevoRiesgo,
                                  nivelRiesgo: nivel,
                                })
                              }
                              className={`flex-1 px-3 py-2 rounded-lg border text-sm font-semibold transition-all ${
                                nuevoRiesgo.nivelRiesgo === nivel
                                  ? getNivelRiesgoColor(nivel)
                                  : "bg-gray-900 border-gray-700 text-gray-400"
                              }`}
                            >
                              {nivel}
                            </button>
                          )
                        )}
                      </div>
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={agregarRiesgo}
                      >
                        Agregar Riesgo
                      </Button>
                    </div>
                  </div>
                )}

                {/* Lista de riesgos del paso actual */}
                {pasoActual && (
                  <div>
                    {pasosTrabajo
                      .find((p) => p.id === pasoActual)
                      ?.riesgos.map((riesgo) => (
                        <div
                          key={riesgo.id}
                          className="mb-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold border ${getNivelRiesgoColor(
                                    riesgo.nivelRiesgo
                                  )}`}
                                >
                                  {riesgo.nivelRiesgo}
                                </span>
                                <p className="text-white text-sm">
                                  {riesgo.descripcion}
                                </p>
                              </div>
                              <div className="space-y-1">
                                {riesgo.controles.map((control, idx) => (
                                  <p
                                    key={idx}
                                    className="text-xs text-gray-400 pl-4"
                                  >
                                    ✓ {control}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                eliminarRiesgo(pasoActual, riesgo.id)
                              }
                              className="ml-2 p-1 rounded hover:bg-red-500/20 text-red-400"
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              agregarControl(pasoActual, riesgo.id)
                            }
                          >
                            + Agregar Control
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: EPP y Herramientas */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  EPP y Herramientas
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    EPP Requerido *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {eppDisponible.map((epp) => (
                      <button
                        key={epp}
                        type="button"
                        onClick={() => toggleEPP(epp)}
                        className={`p-3 rounded-lg border transition-all text-left text-sm ${
                          formData.eppRequerido.includes(epp)
                            ? "bg-primary-500/20 border-primary-500 text-white"
                            : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        {epp}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.eppRequerido.length} EPP seleccionado(s)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Herramientas y Equipos
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {herramientasDisponibles.map((herramienta) => (
                      <button
                        key={herramienta}
                        type="button"
                        onClick={() => toggleHerramienta(herramienta)}
                        className={`p-3 rounded-lg border transition-all text-left text-sm ${
                          formData.herramientas.includes(herramienta)
                            ? "bg-secondary-500/20 border-secondary-500 text-white"
                            : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        {herramienta}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.herramientas.length} herramienta(s)
                    seleccionada(s)
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
              {step < 4 ? (
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
                  Guardar ATS
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
