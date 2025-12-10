"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";

interface Equipment {
  id: string;
  type: string;
  name: string;
  icon: string;
  description: string;
  category: string;
}

interface EquipmentSelectorProps {
  serviceType: string;
  onSelectEquipment: (equipmentType: string) => void;
  completedInspections: string[];
}

const AVAILABLE_EQUIPMENT: Equipment[] = [
  {
    id: "ARNES",
    type: "ARNES",
    name: "Arnés de Cuerpo Completo",
    icon: "🦺",
    description: "Inspección de arnés, costuras, argollas y hebillas",
    category: "EPP Crítico",
  },
  {
    id: "ESLINGA",
    type: "ESLINGA",
    name: "Eslinga de Seguridad",
    icon: "🔗",
    description: "Verificación de eslinga, conectores y estado general",
    category: "EPP Crítico",
  },
  {
    id: "LINEA_VIDA",
    type: "LINEA_VIDA",
    name: "Línea de Vida Retráctil",
    icon: "➰",
    description: "Inspección de mecanismo, cable y certificaciones",
    category: "Sistema de Protección",
  },
  {
    id: "ESCALERA",
    type: "ESCALERA",
    name: "Escalera",
    icon: "🪜",
    description: "Estado de peldaños, estructura y estabilidad",
    category: "Estructura",
  },
  {
    id: "ANDAMIO",
    type: "ANDAMIO",
    name: "Andamio",
    icon: "🏗️",
    description: "Verificación de plataformas, barandas y arriostres",
    category: "Estructura",
  },
  {
    id: "HERRAMIENTA_TALADRO",
    type: "HERRAMIENTA_TALADRO",
    name: "Taladro",
    icon: "🔧",
    description: "Inspección de cable, interruptor y accesorios",
    category: "Herramienta Eléctrica",
  },
  {
    id: "HERRAMIENTA_PULIDORA",
    type: "HERRAMIENTA_PULIDORA",
    name: "Pulidora/Esmeril",
    icon: "⚙️",
    description: "Estado de guarda, disco y cable de alimentación",
    category: "Herramienta Eléctrica",
  },
  {
    id: "TRIPODE",
    type: "TRIPODE",
    name: "Trípode de Rescate",
    icon: "▲",
    description: "Verificación de estabilidad, winch y capacidad",
    category: "Equipo de Rescate",
  },
];

export default function EquipmentSelector({
  serviceType,
  onSelectEquipment,
  completedInspections,
}: EquipmentSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Agrupar por categoría
  const categories = Array.from(
    new Set(AVAILABLE_EQUIPMENT.map((e) => e.category))
  );

  const filteredEquipment = selectedCategory
    ? AVAILABLE_EQUIPMENT.filter((e) => e.category === selectedCategory)
    : AVAILABLE_EQUIPMENT;

  const isCompleted = (equipmentType: string) => {
    return completedInspections.includes(equipmentType);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-white mb-2">
          Selecciona Equipos a Inspeccionar
        </h3>
        <p className="text-gray-400 text-sm">
          Elige los equipos y herramientas que vas a utilizar en este servicio
        </p>
      </div>

      {/* Filtros por categoría */}
      <div className="flex flex-wrap gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedCategory === null
              ? "bg-primary-500 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          Todos
        </motion.button>
        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === category
                ? "bg-primary-500 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {category}
          </motion.button>
        ))}
      </div>

      {/* Grid de equipos */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory || "all"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredEquipment.map((equipment, index) => {
            const completed = isCompleted(equipment.type);

            return (
              <motion.div
                key={equipment.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className={`p-5 rounded-xl border transition-all cursor-pointer ${
                  completed
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-gray-800/50 border-gray-700 hover:border-primary-500/50"
                }`}
                onClick={() => onSelectEquipment(equipment.type)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{equipment.icon}</div>
                  {completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                    >
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
                    </motion.div>
                  )}
                </div>

                <h4 className="text-white font-semibold mb-2 text-sm">
                  {equipment.name}
                </h4>
                <p className="text-gray-400 text-xs mb-3">
                  {equipment.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {equipment.category}
                  </span>
                  <Button
                    variant={completed ? "secondary" : "primary"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEquipment(equipment.type);
                    }}
                  >
                    {completed ? "Ver" : "Inspeccionar"}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Resumen */}
      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Inspecciones Completadas</p>
            <p className="text-2xl font-bold text-white">
              {completedInspections.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Progreso Total</p>
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    (completedInspections.length / AVAILABLE_EQUIPMENT.length) *
                    100
                  }%`,
                }}
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
