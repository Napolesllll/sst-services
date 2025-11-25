"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface PermisoAlturasModalProps {
  serviceId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Trabajador {
  id: string;
  nombre: string;
  cedula: string;
  certificado: string;
  vigencia: string;
}

export default function PermisoAlturasModal({
  serviceId,
  onClose,
  onSuccess,
}: PermisoAlturasModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    horaInicio: "",
    horaFin: "",
    lugar: "",
    descripcionTrabajo: "",
    alturaEstimada: "",
    tipoTrabajo: [] as string[],

    // Verificaciones
    verificaciones: {
      personalCapacitado: false,
      eppCompleto: false,
      puntoAnclaje: false,
      lineaVida: false,
      areaDelimitada: false,
      condicionesClimaticas: false,
      equipoInspeccionado: false,
      planEmergencia: false,
    },

    // Condiciones climáticas
    temperatura: "",
    viento: "",
    lluvia: "NO",
    visibilidad: "BUENA",

    // Equipo de protección
    equipoProteccion: [] as string[],

    // Observaciones
    observaciones: "",
  });

  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [nuevoTrabajador, setNuevoTrabajador] = useState({
    nombre: "",
    cedula: "",
    certificado: "",
    vigencia: "",
  });

  const tiposTrabajo = [
    "Instalación",
    "Mantenimiento",
    "Reparación",
    "Inspección",
    "Limpieza",
    "Pintura",
    "Montaje de estructuras",
    "Demolición",
  ];

  const equiposProteccion = [
    "Arnés de cuerpo completo",
    "Eslinga de posicionamiento",
    "Eslinga de restricción",
    "Línea de vida retráctil",
    "Mosquetones con seguro",
    "Casco con barbiquejo",
    "Guantes",
    "Botas antideslizantes",
    "Gafas de seguridad",
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

  const toggleVerificacion = (key: keyof typeof formData.verificaciones) => {
    setFormData({
      ...formData,
      verificaciones: {
        ...formData.verificaciones,
        [key]: !formData.verificaciones[key],
      },
    });
  };

  const toggleTipoTrabajo = (tipo: string) => {
    setFormData({
      ...formData,
      tipoTrabajo: formData.tipoTrabajo.includes(tipo)
        ? formData.tipoTrabajo.filter((t) => t !== tipo)
        : [...formData.tipoTrabajo, tipo],
    });
  };

  const toggleEquipo = (equipo: string) => {
    setFormData({
      ...formData,
      equipoProteccion: formData.equipoProteccion.includes(equipo)
        ? formData.equipoProteccion.filter((e) => e !== equipo)
        : [...formData.equipoProteccion, equipo],
    });
  };

  const agregarTrabajador = () => {
    if (
      !nuevoTrabajador.nombre ||
      !nuevoTrabajador.cedula ||
      !nuevoTrabajador.certificado ||
      !nuevoTrabajador.vigencia
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
      certificado: "",
      vigencia: "",
    });
    setError("");
  };

  const eliminarTrabajador = (id: string) => {
    setTrabajadores(trabajadores.filter((t) => t.id !== id));
  };

  const handleSubmit = async () => {
    // Validaciones
    if (
      !formData.lugar ||
      !formData.descripcionTrabajo ||
      !formData.alturaEstimada
    ) {
      setError("Completa todos los campos obligatorios");
      return;
    }

    if (!formData.horaInicio || !formData.horaFin) {
      setError("Las horas de inicio y fin son requeridas");
      return;
    }

    if (formData.tipoTrabajo.length === 0) {
      setError("Selecciona al menos un tipo de trabajo");
      return;
    }

    if (trabajadores.length === 0) {
      setError("Agrega al menos un trabajador autorizado");
      return;
    }

    // Verificar que todas las verificaciones estén marcadas
    const todasVerificadas = Object.values(formData.verificaciones).every(
      (v) => v === true
    );
    if (!todasVerificadas) {
      setError("Todas las verificaciones deben estar completadas");
      return;
    }

    if (formData.equipoProteccion.length === 0) {
      setError("Selecciona al menos un equipo de protección");
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
          documentType: "PERMISO_ALTURAS",
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
          className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  ⬆️ Permiso de Trabajo en Alturas
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
                className="h-full bg-gradient-to-r from-orange-600 to-red-600"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Información del Trabajo */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <p className="text-sm text-orange-400">
                    ⚠️ El trabajo en alturas es considerado de alto riesgo. Este
                    permiso debe ser autorizado antes de iniciar cualquier
                    actividad a más de 1.50 metros de altura.
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-white mb-4">
                  Información del Trabajo
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
                    name="alturaEstimada"
                    label="Altura Estimada (metros)"
                    placeholder="Ej: 5.5"
                    value={formData.alturaEstimada}
                    onChange={handleChange}
                    required
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
                      label="Lugar / Ubicación"
                      placeholder="Ubicación exacta del trabajo"
                      value={formData.lugar}
                      onChange={handleChange}
                      required
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
                    rows={3}
                    placeholder="Describe detalladamente el trabajo a realizar..."
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Tipo de Trabajo *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {tiposTrabajo.map((tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => toggleTipoTrabajo(tipo)}
                        className={`p-3 rounded-lg border transition-all text-sm ${
                          formData.tipoTrabajo.includes(tipo)
                            ? "bg-orange-500/20 border-orange-500 text-white"
                            : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Trabajadores Autorizados */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Trabajadores Autorizados
                </h3>

                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="text-sm font-semibold text-white mb-3">
                    Agregar Trabajador
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                      placeholder="N° Certificado Alturas"
                      value={nuevoTrabajador.certificado}
                      onChange={(e) =>
                        setNuevoTrabajador({
                          ...nuevoTrabajador,
                          certificado: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="date"
                      placeholder="Vigencia"
                      label="Vigencia del Certificado"
                      value={nuevoTrabajador.vigencia}
                      onChange={(e) =>
                        setNuevoTrabajador({
                          ...nuevoTrabajador,
                          vigencia: e.target.value,
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
                    + Agregar Trabajador
                  </Button>
                </div>

                {trabajadores.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-400">
                      Trabajadores Registrados ({trabajadores.length})
                    </h4>
                    {trabajadores.map((trabajador) => (
                      <div
                        key={trabajador.id}
                        className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-start justify-between">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                            <div>
                              <p className="text-xs text-gray-500">Nombre</p>
                              <p className="text-sm text-white font-medium">
                                {trabajador.nombre}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Cédula</p>
                              <p className="text-sm text-white">
                                {trabajador.cedula}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Certificado
                              </p>
                              <p className="text-sm text-white">
                                {trabajador.certificado}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Vigencia</p>
                              <p className="text-sm text-white">
                                {trabajador.vigencia}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => eliminarTrabajador(trabajador.id)}
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
                    <p className="text-gray-500">
                      No hay trabajadores autorizados
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Verificaciones de Seguridad */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Verificaciones de Seguridad
                </h3>

                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-6">
                  <p className="text-sm text-red-400 font-semibold">
                    ⚠️ IMPORTANTE: Todas las verificaciones deben estar marcadas
                    antes de autorizar el permiso
                  </p>
                </div>

                <div className="space-y-3">
                  {Object.entries({
                    personalCapacitado:
                      "Personal capacitado y certificado para trabajo en alturas",
                    eppCompleto: "EPP completo y en buen estado",
                    puntoAnclaje: "Punto de anclaje verificado y certificado",
                    lineaVida: "Línea de vida instalada y verificada",
                    areaDelimitada: "Área delimitada y señalizada",
                    condicionesClimaticas: "Condiciones climáticas favorables",
                    equipoInspeccionado: "Equipo inspeccionado y aprobado",
                    planEmergencia: "Plan de emergencia y rescate establecido",
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

                {/* Condiciones Climáticas */}
                <div className="mt-8">
                  <h4 className="text-md font-semibold text-white mb-4">
                    Condiciones Climáticas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="text"
                      name="temperatura"
                      label="Temperatura (°C)"
                      placeholder="Ej: 25"
                      value={formData.temperatura}
                      onChange={handleChange}
                    />
                    <Input
                      type="text"
                      name="viento"
                      label="Velocidad del Viento (km/h)"
                      placeholder="Ej: 15"
                      value={formData.viento}
                      onChange={handleChange}
                    />
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Lluvia
                      </label>
                      <select
                        name="lluvia"
                        value={formData.lluvia}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                      >
                        <option value="NO">No</option>
                        <option value="LEVE">Leve</option>
                        <option value="MODERADA">Moderada</option>
                        <option value="FUERTE">Fuerte</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Visibilidad
                      </label>
                      <select
                        name="visibilidad"
                        value={formData.visibilidad}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                      >
                        <option value="BUENA">Buena</option>
                        <option value="REGULAR">Regular</option>
                        <option value="MALA">Mala</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Equipo de Protección */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Equipo de Protección
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Equipo Requerido *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {equiposProteccion.map((equipo) => (
                      <button
                        key={equipo}
                        type="button"
                        onClick={() => toggleEquipo(equipo)}
                        className={`p-3 rounded-lg border transition-all text-left text-sm ${
                          formData.equipoProteccion.includes(equipo)
                            ? "bg-orange-500/20 border-orange-500 text-white"
                            : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        {equipo}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.equipoProteccion.length} equipo(s) seleccionado(s)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Observaciones Adicionales
                  </label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Observaciones o recomendaciones adicionales..."
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
