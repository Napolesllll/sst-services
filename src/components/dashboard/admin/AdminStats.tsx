"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";

interface Stats {
  pending: number;
  assigned: number;
  inProgress: number;
  completed: number;
  total: number;
}

interface Employee {
  id: string;
}

const statsConfig = [
  {
    title: "Servicios Activos",
    key: "active",
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
    key: "pending",
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
    key: "employees",
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
    title: "Completados (Total)",
    key: "completed",
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
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    total: 0,
  });
  const [employeeCount, setEmployeeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Obtener estadísticas de servicios
      const servicesResponse = await fetch("/api/services/my-services");
      const servicesData = await servicesResponse.json();

      if (servicesResponse.ok) {
        setStats(servicesData.stats);
      }

      // Obtener cantidad de empleados disponibles
      const employeesResponse = await fetch("/api/employees/available");
      const employeesData = await employeesResponse.json();

      if (employeesResponse.ok) {
        setEmployeeCount(employeesData.total || 0);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatValue = (key: string): number => {
    switch (key) {
      case "active":
        return stats.assigned + stats.inProgress;
      case "pending":
        return stats.pending;
      case "employees":
        return employeeCount;
      case "completed":
        return stats.completed;
      default:
        return 0;
    }
  };

  const getChangeIndicator = (
    key: string
  ): { value: string; positive: boolean } => {
    // Aquí puedes implementar lógica para calcular cambios porcentuales
    // Por ahora retornamos valores de ejemplo
    switch (key) {
      case "active":
        return { value: "+12%", positive: true };
      case "pending":
        return {
          value: stats.pending > 0 ? "!" : "✓",
          positive: stats.pending === 0,
        };
      case "employees":
        return { value: `+${employeeCount}`, positive: true };
      case "completed":
        return { value: "+23%", positive: true };
      default:
        return { value: "", positive: true };
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} variant="cyber">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                <div className="w-12 h-6 bg-gray-700 rounded"></div>
              </div>
              <div className="w-24 h-4 bg-gray-700 rounded mb-2"></div>
              <div className="w-16 h-8 bg-gray-700 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => {
        const value = getStatValue(stat.key);
        const change = getChangeIndicator(stat.key);

        return (
          <motion.div
            key={stat.key}
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
                      change.positive ? "text-green-400" : "text-yellow-400"
                    }`}
                  >
                    {stat.key === "pending" && value > 0 ? (
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
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    ) : (
                      change.positive && (
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
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                          />
                        </svg>
                      )
                    )}
                    {change.value}
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">
                  {stat.title}
                </h3>
                <motion.p
                  key={value}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-white"
                >
                  {value}
                </motion.p>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
