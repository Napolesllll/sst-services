"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface DocumentViewerModalProps {
  document: {
    id: string;
    documentType: string;
    completedAt: string;
    content: any;
  };
  onClose: () => void;
}

export default function DocumentViewerModal({
  document,
  onClose,
}: DocumentViewerModalProps) {
  const [activeTab, setActiveTab] = useState("general");

  const renderContent = () => {
    switch (document.documentType) {
      case "CHARLA_SEGURIDAD":
        return renderCharlaSeguridad();
      case "ATS":
        return renderATS();
      case "PERMISO_ALTURAS":
        return renderPermisoAlturas();
      case "PERMISO_ESPACIOS_CONFINADOS":
        return renderPermisoEspacios();
      case "PERMISO_TRABAJO":
        return renderPermisoTrabajo();
      default:
        return <p className="text-gray-400">Tipo de documento no soportado</p>;
    }
  };

  const renderCharlaSeguridad = () => {
    const content = document.content;
    return (
      <div className="space-y-6">
        {/* Información General */}
        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Información General
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Fecha</p>
              <p className="text-white font-medium">{content.fecha}</p>
            </div>
            <div>
              <p className="text-gray-400">Hora</p>
              <p className="text-white font-medium">{content.hora}</p>
            </div>
            <div>
              <p className="text-gray-400">Lugar</p>
              <p className="text-white font-medium">{content.lugar}</p>
            </div>
            <div>
              <p className="text-gray-400">Responsable</p>
              <p className="text-white font-medium">{content.responsable}</p>
            </div>
            <div>
              <p className="text-gray-400">Duración</p>
              <p className="text-white font-medium">
                {content.duracion} minutos
              </p>
            </div>
          </div>
        </div>

        {/* Temas Tratados */}
        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📚</span>
            Temas Tratados
          </h3>
          <div className="flex flex-wrap gap-2">
            {content.temas.map((tema: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-full text-sm"
              >
                {tema}
              </span>
            ))}
          </div>
        </div>

        {/* Asistentes */}
        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">👥</span>
            Asistentes ({content.asistentes.length})
          </h3>
          <div className="space-y-2">
            {content.asistentes.map((asistente: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-900/50 rounded border border-gray-700"
              >
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Nombre</p>
                    <p className="text-sm text-white">{asistente.nombre}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cédula</p>
                    <p className="text-sm text-white">{asistente.cedula}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cargo</p>
                    <p className="text-sm text-white">{asistente.cargo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Riesgos y Medidas */}
        {content.riesgosIdentificados.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Riesgos Identificados
            </h3>
            <div className="flex flex-wrap gap-2">
              {content.riesgosIdentificados.map(
                (riesgo: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 rounded-full text-sm"
                  >
                    {riesgo}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {content.medidasControl.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">✅</span>
              Medidas de Control
            </h3>
            <ul className="space-y-2">
              {content.medidasControl.map((medida: string, idx: number) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-300"
                >
                  <span className="text-green-400 mt-1">✓</span>
                  <span>{medida}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Observaciones */}
        {content.observaciones && (
          <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Observaciones
            </h3>
            <p className="text-sm text-gray-300">{content.observaciones}</p>
          </div>
        )}
      </div>
    );
  };

  const renderATS = () => {
    const content = document.content;
    return (
      <div className="space-y-6">
        {/* Información General */}
        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Información General
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Fecha</p>
              <p className="text-white font-medium">{content.fecha}</p>
            </div>
            <div>
              <p className="text-gray-400">Lugar</p>
              <p className="text-white font-medium">{content.lugar}</p>
            </div>
            <div>
              <p className="text-gray-400">Responsable</p>
              <p className="text-white font-medium">{content.responsable}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400">Trabajo a Realizar</p>
              <p className="text-white font-medium">
                {content.trabajoRealizar}
              </p>
            </div>
          </div>
        </div>

        {/* Personal */}
        {content.personal && content.personal.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Personal Involucrado
            </h3>
            <div className="flex flex-wrap gap-2">
              {content.personal.map((persona: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded text-sm"
                >
                  {persona}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pasos de Trabajo */}
        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Análisis de Trabajo Seguro
          </h3>
          <div className="space-y-4">
            {content.pasosTrabajo.map((paso: any, idx: number) => (
              <div
                key={idx}
                className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">
                    #{idx + 1}
                  </span>
                  <p className="text-white font-medium flex-1">
                    {paso.descripcion}
                  </p>
                </div>

                {paso.riesgos.map((riesgo: any, rIdx: number) => (
                  <div
                    key={rIdx}
                    className="ml-8 mt-3 p-3 bg-gray-800/50 rounded border border-gray-700"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold border ${
                          riesgo.nivelRiesgo === "BAJO"
                            ? "bg-green-500/20 text-green-400 border-green-500/50"
                            : riesgo.nivelRiesgo === "MEDIO"
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                            : riesgo.nivelRiesgo === "ALTO"
                            ? "bg-orange-500/20 text-orange-400 border-orange-500/50"
                            : "bg-red-500/20 text-red-400 border-red-500/50"
                        }`}
                      >
                        {riesgo.nivelRiesgo}
                      </span>
                      <p className="text-sm text-white">{riesgo.descripcion}</p>
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-xs text-gray-400 font-semibold">
                        Controles:
                      </p>
                      {riesgo.controles.map((control: string, cIdx: number) => (
                        <p key={cIdx} className="text-xs text-gray-300">
                          ✓ {control}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* EPP y Herramientas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              EPP Requerido
            </h3>
            <div className="space-y-2">
              {content.eppRequerido.map((epp: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm text-gray-300"
                >
                  <span className="text-green-400">✓</span>
                  <span>{epp}</span>
                </div>
              ))}
            </div>
          </div>

          {content.herramientas && content.herramientas.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                Herramientas
              </h3>
              <div className="space-y-2">
                {content.herramientas.map(
                  (herramienta: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-gray-300"
                    >
                      <span className="text-blue-400">🔧</span>
                      <span>{herramienta}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPermisoAlturas = () => {
    const content = document.content;
    return (
      <div className="space-y-6">
        {/* Header de Alerta */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <p className="text-orange-400 font-semibold">
            ⚠️ PERMISO DE TRABAJO EN ALTURAS
          </p>
          <p className="text-sm text-orange-300/80 mt-1">
            Autorización para trabajos a más de 1.50 metros de altura
          </p>
        </div>

        {/* Información del Trabajo */}
        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Información del Trabajo
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Fecha</p>
              <p className="text-white font-medium">{content.fecha}</p>
            </div>
            <div>
              <p className="text-gray-400">Altura Estimada</p>
              <p className="text-white font-medium">
                {content.alturaEstimada} metros
              </p>
            </div>
            <div>
              <p className="text-gray-400">Hora Inicio</p>
              <p className="text-white font-medium">{content.horaInicio}</p>
            </div>
            <div>
              <p className="text-gray-400">Hora Fin</p>
              <p className="text-white font-medium">{content.horaFin}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400">Lugar</p>
              <p className="text-white font-medium">{content.lugar}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400">Descripción del Trabajo</p>
              <p className="text-white font-medium">
                {content.descripcionTrabajo}
              </p>
            </div>
          </div>
        </div>

        {/* Tipo de Trabajo */}
        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Tipo de Trabajo
          </h3>
          <div className="flex flex-wrap gap-2">
            {content.tipoTrabajo.map((tipo: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-orange-500/20 border border-orange-500/50 text-orange-400 rounded-full text-sm"
              >
                {tipo}
              </span>
            ))}
          </div>
        </div>

        {/* Trabajadores Autorizados */}
        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Trabajadores Autorizados
          </h3>
          <div className="space-y-3">
            {content.trabajadores.map((trabajador: any, idx: number) => (
              <div
                key={idx}
                className="bg-gray-900/50 rounded p-4 border border-gray-700"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Nombre</p>
                    <p className="text-white font-medium">
                      {trabajador.nombre}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Cédula</p>
                    <p className="text-white font-medium">
                      {trabajador.cedula}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Certificado</p>
                    <p className="text-white font-medium">
                      {trabajador.certificado}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Vigencia</p>
                    <p className="text-white font-medium">
                      {trabajador.vigencia}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verificaciones */}
        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Verificaciones de Seguridad
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(content.verificaciones).map(([key, value]) => (
              <div
                key={key}
                className={`flex items-center gap-3 p-3 rounded ${
                  value ? "bg-green-500/10" : "bg-red-500/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    value ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {value ? (
                    <span className="text-white text-xs">✓</span>
                  ) : (
                    <span className="text-white text-xs">✗</span>
                  )}
                </div>
                <span className="text-sm text-white capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Condiciones Climáticas */}
        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Condiciones Climáticas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Temperatura</p>
              <p className="text-white font-medium">{content.temperatura}°C</p>
            </div>
            <div>
              <p className="text-gray-400">Viento</p>
              <p className="text-white font-medium">{content.viento} km/h</p>
            </div>
            <div>
              <p className="text-gray-400">Lluvia</p>
              <p className="text-white font-medium">{content.lluvia}</p>
            </div>
            <div>
              <p className="text-gray-400">Visibilidad</p>
              <p className="text-white font-medium">{content.visibilidad}</p>
            </div>
          </div>
        </div>

        {/* Equipo de Protección */}
        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Equipo de Protección
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {content.equipoProteccion.map((equipo: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm text-gray-300"
              >
                <span className="text-green-400">✓</span>
                <span>{equipo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Observaciones */}
        {content.observaciones && (
          <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Observaciones
            </h3>
            <p className="text-sm text-gray-300">{content.observaciones}</p>
          </div>
        )}
      </div>
    );
  };

  const renderPermisoEspacios = () => {
    return (
      <div className="text-gray-400">
        Vista de Permiso de Espacios Confinados (similar estructura)
      </div>
    );
  };

  const renderPermisoTrabajo = () => {
    const content = document.content;
    return (
      <div className="space-y-6">
        {/* Información General */}
        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Información General
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Fecha</p>
              <p className="text-white font-medium">{content.fecha}</p>
            </div>
            <div>
              <p className="text-gray-400">Área</p>
              <p className="text-white font-medium">{content.area}</p>
            </div>
            <div>
              <p className="text-gray-400">Hora Inicio</p>
              <p className="text-white font-medium">{content.horaInicio}</p>
            </div>
            <div>
              <p className="text-gray-400">Hora Fin</p>
              <p className="text-white font-medium">{content.horaFin}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400">Lugar</p>
              <p className="text-white font-medium">{content.lugar}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400">Responsable de la Obra</p>
              <p className="text-white font-medium">
                {content.responsableObra}
              </p>
            </div>
          </div>
        </div>

        {/* Resto del contenido similar a otros permisos... */}
      </div>
    );
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
                <h2 className="text-2xl font-bold text-white">Ver Documento</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Completado:{" "}
                  {new Date(document.completedAt).toLocaleString("es-CO")}
                </p>
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
          </div>

          {/* Content */}
          <div className="p-6">{renderContent()}</div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
