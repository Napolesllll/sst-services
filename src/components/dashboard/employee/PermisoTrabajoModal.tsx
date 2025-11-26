"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface PermisoTrabajoModalProps {
  serviceId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Trabajador {
  id: string;
  nombre: string;
  cedula: string;
  cargo: string;
}

export default function PermisoTrabajoModal({
  serviceId,
  onClose,
  onSuccess,
}: PermisoTrabajoModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    horaInicio: "",
    horaFin: "",
    lugar: "",
    area: "",
    descripcionTrabajo: "",
    nombreContratista: "",
    responsableObra: "",
    telefonoContacto: "",

    // Tipos de riesgo
    riesgosPresentes: [] as string[],

    // Verificaciones de seguridad
    verificaciones: {
      areaDelimitada: false,
      senalizacionColocada: false,
      eppVerificado: false,
      herramientasInspeccionadas: false,
      personalCapacitado: false,
      procedimientosComunicados: false,
      emergenciasIdentificadas: false,
      permisoEspecialRequerido: false,
    },

    // EPP requerido
    eppRequerido: [] as string[],

    // Herramientas y equipos
    herramientas: [] as string[],

    // Medidas de control
    medidasControl: [] as string[],

    observaciones: "",
  });

  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [nuevoTrabajador, setNuevoTrabajador] = useState({
    nombre: "",
    cedula: "",
    cargo: "",
  });

  const tiposRiesgo = [
    "Caída de objetos",
    "Caída de personas",
    "Golpes y contusiones",
    "Atrapamiento",
    "Contacto eléctrico",
    "Exposición a químicos",
    "Ruido",
    "Vibraciones",
    "Radiación",
    "Temperaturas extremas",
    "Sobreesfuerzo",
    "Cortes y heridas",
    "Proyección de partículas",
    "Incendio",
    "Explosión",
    "Ergonómico",
  ];

  const eppDisponible = [
    "Casco",
    "Gafas de seguridad",
    "Careta facial",
    "Protección auditiva",
    "Mascarilla desechable",
    "Respirador",
    "Guantes de seguridad",
    "Guantes dieléctricos",
    "Guantes químicos",
    "Botas de seguridad",
    "Botas dieléctricas",
    "Chaleco reflectivo",
    "Ropa de trabajo",
    "Delantal",
  ];

  const herramientasComunes = [
    "Taladro",
    "Pulidora",
    "Amoladora",
    "Sierra",
    "Martillo",
    "Destornilladores",
    "Llaves",
    "Alicates",
    "Multímetro",
    "Escalera",
    "Andamio",
    "Extensiones eléctricas",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleVerificacion = (key: keyof typeof formData.verificaciones) => {
    setFormData({
      ...formData,
      verificaciones: {
        ...formData.verificaciones,
        [key]: !formData.verificaciones[key],
      },
    });
  };

  const toggleRiesgo = (riesgo: string) => {
    setFormData({
      ...formData,
      riesgosPresentes: formData.riesgosPresentes.includes(riesgo)
        ? formData.riesgosPresentes.filter((r) => r !== riesgo)
        : [...formData.riesgosPresentes, riesgo],
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

  const agregarTrabajador = () => {
    if (
      !nuevoTrabajador.nombre ||
      !nuevoTrabajador.cedula ||
      !nuevoTrabajador.cargo
    ) {
      setError("Completa todos los campos del trabajador");
      return;
    }

    setTrabajadores([
      ...trabajadores,
      {
        id: Date.now().toString(),
        ...nuevoTrabajador,
      },
    ]);

    setNuevoTrabajador({
      nombre: "",
      cedula: "",
      cargo: "",
    });
    setError("");
  };

  const eliminarTrabajador = (id: string) => {
    setTrabajadores(trabajadores.filter((t) => t.id !== id));
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
    if (
      !formData.lugar ||
      !formData.descripcionTrabajo ||
      !formData.responsableObra
    ) {
      setError("Completa todos los campos obligatorios");
      return;
    }

    if (!formData.horaInicio || !formData.horaFin) {
      setError("Las horas de inicio y fin son requeridas");
      return;
    }

    if (trabajadores.length === 0) {
      setError("Agrega al menos un trabajador");
      return;
    }

    if (formData.riesgosPresentes.length === 0) {
      setError("Identifica al menos un riesgo");
      return;
    }

    const todasVerificadas = Object.values(formData.verificaciones).every(
      (v) => v === true
    );
    if (!todasVerificadas) {
      setError("Todas las verificaciones deben estar completadas");
      return;
    }

    if (formData.eppRequerido.length === 0) {
      setError("Selecciona al menos un EPP requerido");
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
          documentType: "PERMISO_TRABAJO",
          content: {
            ...formData,
            trabajadores,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar permiso");
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
          className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  ✅ Permiso de Trabajo
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

            <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${(step / 4) * 100}%` }}
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-600"
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
                    name="area"
                    label="Área"
                    placeholder="Ej: Producción, Mantenimiento"
                    value={formData.area}
                    onChange={handleChange}
                  />

                  <Input
                    type="time"
                    name="horaInicio"
                    label="Hora de Inicio"
                    value={formData.horaInicio}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    type="time"
                    name="horaFin"
                    label="Hora de Finalización"
                    value={formData.horaFin}
                    onChange={handleChange}
                    required
                  />

                  <div className="md:col-span-2">
                    <Input
                      type="text"
                      name="lugar"
                      label="Lugar / Ubicación *"
                      placeholder="Ubicación específica del trabajo"
                      value={formData.lugar}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Input
                    type="text"
                    name="nombreContratista"
                    label="Nombre Contratista/Empresa"
                    placeholder="Empresa ejecutora"
                    value={formData.nombreContratista}
                    onChange={handleChange}
                  />

                  <Input
                    type="text"
                    name="responsableObra"
                    label="Responsable de la Obra *"
                    placeholder="Supervisor/Coordinador"
                    value={formData.responsableObra}
                    onChange={handleChange}
                    required
                  />

                  <div className="md:col-span-2">
                    <Input
                      type="tel"
                      name="telefonoContacto"
                      label="Teléfono de Contacto"
                      placeholder="+57 300 123 4567"
                      value={formData.telefonoContacto}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Descripción del Trabajo *
                  </label>
                  <textarea
                    name="descripcionTrabajo"
                    value={formData.descripcionTrabajo}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe detalladamente el trabajo a realizar..."
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Personal y Riesgos */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Personal y Evaluación de Riesgos
                </h3>

                {/* Personal */}
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="text-sm font-semibold text-white mb-3">
                    Agregar Personal
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      type="text"
                      placeholder="Nombre completo"
                      value={nuevoTrabajador.nombre}
                      onChange={(e) =>
                        setNuevoTrabajador({
                          ...nuevoTrabajador,
                          nombre: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="text"
                      placeholder="Cédula"
                      value={nuevoTrabajador.cedula}
                      onChange={(e) =>
                        setNuevoTrabajador({
                          ...nuevoTrabajador,
                          cedula: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="text"
                      placeholder="Cargo"
                      value={nuevoTrabajador.cargo}
                      onChange={(e) =>
                        setNuevoTrabajador({
                          ...nuevoTrabajador,
                          cargo: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-3"
                    onClick={agregarTrabajador}
                  >
                    + Agregar
                  </Button>
                </div>

                {trabajadores.length > 0 && (
                  <div className="space-y-2">
                    {trabajadores.map((trabajador) => (
                      <div
                        key={trabajador.id}
                        className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 flex items-center justify-between"
                      >
                        <div className="flex gap-4">
                          <span className="text-sm text-white">
                            {trabajador.nombre}
                          </span>
                          <span className="text-sm text-gray-400">
                            {trabajador.cedula}
                          </span>
                          <span className="text-sm text-gray-500">
                            {trabajador.cargo}
                          </span>
                        </div>
                        <button
                          onClick={() => eliminarTrabajador(trabajador.id)}
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
                      </div>
                    ))}
                  </div>
                )}

                {/* Riesgos */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Riesgos Presentes *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {tiposRiesgo.map((riesgo) => (
                      <button
                        key={riesgo}
                        type="button"
                        onClick={() => toggleRiesgo(riesgo)}
                        className={`p-2 rounded-lg border transition-all text-sm ${
                          formData.riesgosPresentes.includes(riesgo)
                            ? "bg-orange-500/20 border-orange-500 text-white"
                            : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        {riesgo}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Verificaciones */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Verificaciones de Seguridad
                </h3>

                <div className="space-y-3">
                  {Object.entries({
                    areaDelimitada: "Área de trabajo delimitada y señalizada",
                    senalizacionColocada: "Señalización de seguridad colocada",
                    eppVerificado: "EPP verificado y en buen estado",
                    herramientasInspeccionadas:
                      "Herramientas y equipos inspeccionados",
                    personalCapacitado: "Personal capacitado para el trabajo",
                    procedimientosComunicados:
                      "Procedimientos de trabajo comunicados",
                    emergenciasIdentificadas:
                      "Rutas de emergencia identificadas",
                    permisoEspecialRequerido:
                      "Permisos especiales obtenidos (si aplica)",
                  }).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() =>
                        toggleVerificacion(
                          key as keyof typeof formData.verificaciones
                        )
                      }
                      className={`w-full p-4 rounded-lg border transition-all text-left ${
                        formData.verificaciones[
                          key as keyof typeof formData.verificaciones
                        ]
                          ? "bg-green-500/20 border-green-500 text-white"
                          : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                            formData.verificaciones[
                              key as keyof typeof formData.verificaciones
                            ]
                              ? "border-green-500 bg-green-500"
                              : "border-gray-600"
                          }`}
                        >
                          {formData.verificaciones[
                            key as keyof typeof formData.verificaciones
                          ] && (
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
                        </div>
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: EPP y Controles */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  EPP, Herramientas y Controles
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
                        className={`p-2 rounded-lg border transition-all text-sm ${
                          formData.eppRequerido.includes(epp)
                            ? "bg-blue-500/20 border-blue-500 text-white"
                            : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        {epp}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Herramientas y Equipos
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {herramientasComunes.map((herramienta) => (
                      <button
                        key={herramienta}
                        type="button"
                        onClick={() => toggleHerramienta(herramienta)}
                        className={`p-2 rounded-lg border transition-all text-sm ${
                          formData.herramientas.includes(herramienta)
                            ? "bg-cyan-500/20 border-cyan-500 text-white"
                            : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        {herramienta}
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
                    >
                      + Agregar
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
                  Autorizar Permiso
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
