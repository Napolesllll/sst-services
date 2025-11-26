"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface PermisoEspaciosConfinadosModalProps {
  serviceId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Trabajador {
  id: string;
  nombre: string;
  cedula: string;
  rol: string;
  certificado: string;
}

interface MedicionGas {
  id: string;
  hora: string;
  oxigeno: string;
  co: string;
  h2s: string;
  lel: string;
  aceptable: boolean;
}

export default function PermisoEspaciosConfinadosModal({
  serviceId,
  onClose,
  onSuccess,
}: PermisoEspaciosConfinadosModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    horaInicio: "",
    horaFin: "",
    lugar: "",
    descripcionEspacio: "",
    tipoEspacio: "",
    descripcionTrabajo: "",

    // Peligros identificados
    peligros: [] as string[],

    // Verificaciones previas
    verificaciones: {
      espacioAislado: false,
      energiasControladas: false,
      atmosferaVerificada: false,
      ventilaciónInstalada: false,
      equipoRescate: false,
      comunicacionEstablecida: false,
      vigiaAsignado: false,
      eppCompleto: false,
      permisoTrabajo: false,
      capacitacionVerificada: false,
    },

    // Equipo de protección
    equipoProteccion: [] as string[],

    // Equipo de rescate
    equipoRescate: [] as string[],

    observaciones: "",
  });

  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [mediciones, setMediciones] = useState<MedicionGas[]>([]);

  const [nuevoTrabajador, setNuevoTrabajador] = useState({
    nombre: "",
    cedula: "",
    rol: "",
    certificado: "",
  });

  const [nuevaMedicion, setNuevaMedicion] = useState({
    hora: "",
    oxigeno: "",
    co: "",
    h2s: "",
    lel: "",
  });

  const tiposEspacio = [
    "Tanque",
    "Cisterna",
    "Pozo",
    "Túnel",
    "Alcantarilla",
    "Silo",
    "Bodega de barco",
    "Fosa séptica",
    "Reactor",
    "Otro",
  ];

  const peligrosComunes = [
    "Deficiencia de oxígeno",
    "Gases tóxicos",
    "Gases inflamables",
    "Atmósfera explosiva",
    "Riesgo de ahogamiento",
    "Sepultamiento",
    "Configuración convergente",
    "Riesgo eléctrico",
    "Riesgo mecánico",
    "Calor/frío extremo",
    "Ruido excesivo",
    "Pobre visibilidad",
  ];

  const equiposProteccion = [
    "Arnés de cuerpo completo",
    "Línea de vida",
    "Equipo de respiración autónoma (SCBA)",
    "Máscara con suministro de aire",
    "Detector de gases portátil",
    "Casco",
    "Guantes",
    "Botas",
    "Ropa de protección química",
    "Protección auditiva",
  ];

  const equiposRescate = [
    "Trípode de rescate",
    "Winch/polipasto",
    "Camilla",
    "Equipo de respiración adicional",
    "Cuerdas de rescate",
    "Equipo de comunicación",
    "Botiquín de primeros auxilios",
    "Equipo de reanimación",
  ];

  const roles = [
    "Entrante autorizado",
    "Vigía/Supervisor",
    "Rescatista",
    "Coordinador de emergencias",
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

  const togglePeligro = (peligro: string) => {
    setFormData({
      ...formData,
      peligros: formData.peligros.includes(peligro)
        ? formData.peligros.filter((p) => p !== peligro)
        : [...formData.peligros, peligro],
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

  const toggleEquipoRescate = (equipo: string) => {
    setFormData({
      ...formData,
      equipoRescate: formData.equipoRescate.includes(equipo)
        ? formData.equipoRescate.filter((e) => e !== equipo)
        : [...formData.equipoRescate, equipo],
    });
  };

  const agregarTrabajador = () => {
    if (
      !nuevoTrabajador.nombre ||
      !nuevoTrabajador.cedula ||
      !nuevoTrabajador.rol ||
      !nuevoTrabajador.certificado
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
      rol: "",
      certificado: "",
    });
    setError("");
  };

  const eliminarTrabajador = (id: string) => {
    setTrabajadores(trabajadores.filter((t) => t.id !== id));
  };

  const agregarMedicion = () => {
    if (
      !nuevaMedicion.hora ||
      !nuevaMedicion.oxigeno ||
      !nuevaMedicion.co ||
      !nuevaMedicion.h2s ||
      !nuevaMedicion.lel
    ) {
      setError("Completa todos los campos de la medición");
      return;
    }

    // Verificar valores aceptables
    const o2 = parseFloat(nuevaMedicion.oxigeno);
    const coVal = parseFloat(nuevaMedicion.co);
    const h2sVal = parseFloat(nuevaMedicion.h2s);
    const lelVal = parseFloat(nuevaMedicion.lel);

    const aceptable =
      o2 >= 19.5 && o2 <= 23.5 && coVal < 25 && h2sVal < 10 && lelVal < 10;

    setMediciones([
      ...mediciones,
      {
        id: Date.now().toString(),
        ...nuevaMedicion,
        aceptable,
      },
    ]);

    setNuevaMedicion({
      hora: "",
      oxigeno: "",
      co: "",
      h2s: "",
      lel: "",
    });
    setError("");
  };

  const eliminarMedicion = (id: string) => {
    setMediciones(mediciones.filter((m) => m.id !== id));
  };

  const handleSubmit = async () => {
    // Validaciones
    if (
      !formData.lugar ||
      !formData.descripcionEspacio ||
      !formData.tipoEspacio
    ) {
      setError("Completa todos los campos obligatorios");
      return;
    }

    if (trabajadores.length === 0) {
      setError("Agrega al menos un trabajador autorizado");
      return;
    }

    if (mediciones.length === 0) {
      setError("Debes realizar al menos una medición de atmósfera");
      return;
    }

    // Verificar que todas las mediciones sean aceptables
    const todasAceptables = mediciones.every((m) => m.aceptable);
    if (!todasAceptables) {
      if (
        !confirm(
          "Algunas mediciones no son aceptables. ¿Deseas continuar de todas formas? (No recomendado)"
        )
      ) {
        return;
      }
    }

    // Verificar verificaciones
    const todasVerificadas = Object.values(formData.verificaciones).every(
      (v) => v === true
    );
    if (!todasVerificadas) {
      setError("Todas las verificaciones deben estar completadas");
      return;
    }

    if (formData.peligros.length === 0) {
      setError("Identifica al menos un peligro");
      return;
    }

    if (formData.equipoProteccion.length === 0) {
      setError("Selecciona al menos un equipo de protección");
      return;
    }

    if (formData.equipoRescate.length === 0) {
      setError("Selecciona al menos un equipo de rescate");
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
          documentType: "PERMISO_ESPACIOS_CONFINADOS",
          content: {
            ...formData,
            trabajadores,
            mediciones,
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
          className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  🚪 Permiso de Entrada a Espacios Confinados
                </h2>
                <p className="text-gray-400 text-sm">Paso {step} de 5</p>
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
                animate={{ width: `${(step / 5) * 100}%` }}
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Información del Espacio */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400 font-semibold">
                    ⚠️ PELIGRO: Los espacios confinados son ambientes de ALTO
                    RIESGO. La entrada sin permisos y medidas adecuadas puede
                    ser FATAL.
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-white mb-4">
                  Información del Espacio Confinado
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

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Tipo de Espacio *
                    </label>
                    <select
                      name="tipoEspacio"
                      value={formData.tipoEspacio}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    >
                      <option value="">Selecciona...</option>
                      {tiposEspacio.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </div>

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
                </div>

                <Input
                  type="text"
                  name="lugar"
                  label="Ubicación Exacta"
                  placeholder="Ubicación específica del espacio confinado"
                  value={formData.lugar}
                  onChange={handleChange}
                  required
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Descripción del Espacio *
                  </label>
                  <textarea
                    name="descripcionEspacio"
                    value={formData.descripcionEspacio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe las características del espacio (dimensiones, accesos, contenido previo, etc.)"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Trabajo a Realizar *
                  </label>
                  <textarea
                    name="descripcionTrabajo"
                    value={formData.descripcionTrabajo}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe el trabajo que se realizará dentro del espacio"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Peligros Identificados *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {peligrosComunes.map((peligro) => (
                      <button
                        key={peligro}
                        type="button"
                        onClick={() => togglePeligro(peligro)}
                        className={`p-3 rounded-lg border transition-all text-left text-sm ${
                          formData.peligros.includes(peligro)
                            ? "bg-red-500/20 border-red-500 text-white"
                            : "bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        {peligro}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Medición de Atmósfera */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Medición de Atmósfera
                </h3>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-400 mb-2 font-semibold">
                    Valores Aceptables:
                  </p>
                  <ul className="text-xs text-yellow-300 space-y-1">
                    <li>• Oxígeno (O₂): 19.5% - 23.5%</li>
                    <li>• Monóxido de Carbono (CO): {"<"} 25 ppm</li>
                    <li>• Sulfuro de Hidrógeno (H₂S): {"<"} 10 ppm</li>
                    <li>• Límite Explosivo Inferior (LEL): {"<"} 10%</li>
                  </ul>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="text-sm font-semibold text-white mb-3">
                    Agregar Medición
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <Input
                      type="time"
                      placeholder="Hora"
                      label="Hora"
                      value={nuevaMedicion.hora}
                      onChange={(e) =>
                        setNuevaMedicion({
                          ...nuevaMedicion,
                          hora: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="19.5-23.5"
                      label="O₂ (%)"
                      value={nuevaMedicion.oxigeno}
                      onChange={(e) =>
                        setNuevaMedicion({
                          ...nuevaMedicion,
                          oxigeno: e.target.value,
                        })
                      }
                      step="0.1"
                    />
                    <Input
                      type="number"
                      placeholder="< 25"
                      label="CO (ppm)"
                      value={nuevaMedicion.co}
                      onChange={(e) =>
                        setNuevaMedicion({
                          ...nuevaMedicion,
                          co: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="< 10"
                      label="H₂S (ppm)"
                      value={nuevaMedicion.h2s}
                      onChange={(e) =>
                        setNuevaMedicion({
                          ...nuevaMedicion,
                          h2s: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="< 10"
                      label="LEL (%)"
                      value={nuevaMedicion.lel}
                      onChange={(e) =>
                        setNuevaMedicion({
                          ...nuevaMedicion,
                          lel: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-3"
                    onClick={agregarMedicion}
                  >
                    + Agregar Medición
                  </Button>
                </div>

                {mediciones.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-400">
                      Mediciones Registradas ({mediciones.length})
                    </h4>
                    {mediciones.map((medicion) => (
                      <div
                        key={medicion.id}
                        className={`p-4 rounded-lg border ${
                          medicion.aceptable
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-red-500/10 border-red-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex gap-4 flex-1">
                            <div>
                              <p className="text-xs text-gray-500">Hora</p>
                              <p className="text-sm text-white font-mono">
                                {medicion.hora}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">O₂</p>
                              <p className="text-sm text-white font-mono">
                                {medicion.oxigeno}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">CO</p>
                              <p className="text-sm text-white font-mono">
                                {medicion.co} ppm
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">H₂S</p>
                              <p className="text-sm text-white font-mono">
                                {medicion.h2s} ppm
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">LEL</p>
                              <p className="text-sm text-white font-mono">
                                {medicion.lel}%
                              </p>
                            </div>
                            <div className="flex items-center">
                              {medicion.aceptable ? (
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded border border-green-500/50">
                                  ✓ ACEPTABLE
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded border border-red-500/50">
                                  ⚠ NO ACEPTABLE
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => eliminarMedicion(medicion.id)}
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
                                d="M6 18L18 6M6 6l12 12"
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
                      No hay mediciones registradas
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Personal Autorizado */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Personal Autorizado
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
                    <div>
                      <select
                        value={nuevoTrabajador.rol}
                        onChange={(e) =>
                          setNuevoTrabajador({
                            ...nuevoTrabajador,
                            rol: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                      >
                        <option value="">Seleccionar rol...</option>
                        {roles.map((rol) => (
                          <option key={rol} value={rol}>
                            {rol}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      type="text"
                      placeholder="N° Certificado"
                      value={nuevoTrabajador.certificado}
                      onChange={(e) =>
                        setNuevoTrabajador({
                          ...nuevoTrabajador,
                          certificado: e.target.value,
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
                              <p className="text-xs text-gray-500">Rol</p>
                              <p className="text-sm text-white">
                                {trabajador.rol}
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
                                d="M6 18L18 6M6 6l12 12"
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
                      No hay trabajadores registrados
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: Equipos de Protección */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Equipos de Protección y Rescate
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Equipo de Protección Personal */}
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-semibold text-white mb-3">
                      Equipo de Protección Personal (EPP) *
                    </h4>
                    <div className="space-y-2">
                      {equiposProteccion.map((equipo) => (
                        <label
                          key={equipo}
                          className="flex items-center space-x-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.equipoProteccion.includes(equipo)}
                            onChange={() => toggleEquipo(equipo)}
                            className="w-4 h-4 text-primary-600 bg-gray-800 border-gray-700 rounded focus:ring-primary-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-300">
                            {equipo}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Equipo de Rescate */}
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <h4 className="text-sm font-semibold text-white mb-3">
                      Equipo de Rescate y Emergencia *
                    </h4>
                    <div className="space-y-2">
                      {equiposRescate.map((equipo) => (
                        <label
                          key={equipo}
                          className="flex items-center space-x-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.equipoRescate.includes(equipo)}
                            onChange={() => toggleEquipoRescate(equipo)}
                            className="w-4 h-4 text-primary-600 bg-gray-800 border-gray-700 rounded focus:ring-primary-500 focus:ring-2"
                          />
                          <span className="text-sm text-gray-300">
                            {equipo}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Verificaciones Finales */}
            {step === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Verificaciones Finales y Observaciones
                </h3>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-400 font-semibold">
                    ✅ Verifica que todas las condiciones de seguridad estén
                    cumplidas antes de autorizar la entrada
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white">
                      Verificaciones de Aislamiento
                    </h4>
                    {[
                      {
                        key: "espacioAislado",
                        label: "Espacio aislado y señalizado",
                      },
                      {
                        key: "energiasControladas",
                        label: "Energías peligrosas controladas (LOTO)",
                      },
                      {
                        key: "atmosferaVerificada",
                        label: "Atmósfera verificada y monitoreada",
                      },
                      {
                        key: "ventilaciónInstalada",
                        label: "Ventilación instalada y funcionando",
                      },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            formData.verificaciones[
                              item.key as keyof typeof formData.verificaciones
                            ]
                          }
                          onChange={() =>
                            toggleVerificacion(
                              item.key as keyof typeof formData.verificaciones
                            )
                          }
                          className="w-4 h-4 text-primary-600 bg-gray-800 border-gray-700 rounded focus:ring-primary-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-300">
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white">
                      Verificaciones de Personal y Equipos
                    </h4>
                    {[
                      {
                        key: "equipoRescate",
                        label: "Equipo de rescate disponible y verificado",
                      },
                      {
                        key: "comunicacionEstablecida",
                        label: "Comunicación establecida y probada",
                      },
                      {
                        key: "vigiaAsignado",
                        label: "Vigía asignado y en posición",
                      },
                      {
                        key: "eppCompleto",
                        label: "EPP completo y en buen estado",
                      },
                      {
                        key: "permisoTrabajo",
                        label: "Permiso de trabajo explicado y entendido",
                      },
                      {
                        key: "capacitacionVerificada",
                        label: "Capacitación verificada para todos",
                      },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            formData.verificaciones[
                              item.key as keyof typeof formData.verificaciones
                            ]
                          }
                          onChange={() =>
                            toggleVerificacion(
                              item.key as keyof typeof formData.verificaciones
                            )
                          }
                          className="w-4 h-4 text-primary-600 bg-gray-800 border-gray-700 rounded focus:ring-primary-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-300">
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
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
                    placeholder="Cualquier observación adicional sobre las condiciones, riesgos o procedimientos..."
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                  />
                </div>

                {/* Resumen de Validaciones */}
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <h4 className="text-sm font-semibold text-white mb-3">
                    Resumen de Validaciones
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div
                      className={`p-2 rounded text-center ${
                        formData.peligros.length > 0
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      Peligros: {formData.peligros.length}
                    </div>
                    <div
                      className={`p-2 rounded text-center ${
                        trabajadores.length > 0
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      Trabajadores: {trabajadores.length}
                    </div>
                    <div
                      className={`p-2 rounded text-center ${
                        mediciones.length > 0
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      Mediciones: {mediciones.length}
                    </div>
                    <div
                      className={`p-2 rounded text-center ${
                        Object.values(formData.verificaciones).every((v) => v)
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      Verificaciones:{" "}
                      {
                        Object.values(formData.verificaciones).filter((v) => v)
                          .length
                      }
                      /10
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={step === 1 ? onClose : () => setStep(step - 1)}
                disabled={loading}
              >
                {step === 1 ? "Cancelar" : "Anterior"}
              </Button>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">Paso {step} de 5</span>

                {step < 5 ? (
                  <Button
                    variant="primary"
                    onClick={() => setStep(step + 1)}
                    disabled={loading}
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={loading}
                  >
                    {loading ? "Generando Permiso..." : "Autorizar Entrada"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
