"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";

const stats = [
  {
    title: "Servicios Activos",
    value: "24",
    change: "+12%",
    positive: true,
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
    color: "from-blue-600 to-cyan-600",
  },
  {
    title: "Solicitudes Pendientes",
    value: "5",
    change: "-8%",
    positive: true,
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    color: "from-yellow-600 to-orange-600",
  },
  {
    title: "Empleados Disponibles",
    value: "18",
    change: "+3",
    positive: true,
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    color: "from-green-600 to-emerald-600",
  },
  {
    title: "Completados (Mes)",
    value: "142",
    change: "+23%",
    positive: true,
    icon: (
      <svg
        className="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    color: "from-purple-600 to-pink-600",
  },
];

export default function AdminStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card variant="cyber" hover className="relative overflow-hidden">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`}
            ></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}
                >
                  {stat.icon}
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.positive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  <svg
                    className={`w-4 h-4 ${stat.positive ? "" : "rotate-180"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  {stat.change}
                </div>
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
