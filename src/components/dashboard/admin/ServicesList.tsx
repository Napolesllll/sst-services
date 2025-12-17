// components/dashboard/admin/ServicesList.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ServiceDetailsModal from "./ServiceDetailsModal";

interface Service {
  id: string;
  serviceType: string;
  status: string;
  description: string;
  empresaContratante: string;
  municipio: string;
  createdAt: string;
  fechaInicio: string;
  requiredDocs?: string[]; // Documentos configurados
  requiredInspections?: string[]; // Inspecciones configuradas
  client: {
    name: string;
    email: string;
  };
  employee: {
    name: string;
  } | null;
}

const statusConfig = {
  PENDING: {
    label: "Pendiente",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  },
  ASSIGNED: {
    label: "Asignado",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  },
  IN_PROGRESS: {
    label: "En Progreso",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  },
  COMPLETED: {
    label: "Completado",
    color: "bg-green-500/20 text-green-400 border-green-500/50",
  },
  CANCELLED: {
    label: "Cancelado",
    color: "bg-red-500/20 text-red-400 border-red-500/50",
  },
  POSTPONED: {
    label: "Aplazado",
    color: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  },
  REOPENED: {
    label: "Reabierto",
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
  },
};

const serviceTypeNames: Record<string, string> = {
  PROFESIONAL_SST: "Profesional SST",
  TECNOLOGO_SST: "Tecnólogo SST",
  TECNICO_SST: "Técnico SST",
  COORDINADOR_ALTURAS: "Coordinador de Alturas",
  SUPERVISOR_ESPACIOS_CONFINADOS: "Supervisor Espacios Confinados",
  CAPACITACIONES_CURSOS: "Capacitaciones",
  ALQUILER_EQUIPOS: "Alquiler de Equipos",
  ANDAMIERO: "Andamiero",
  AUDITORIA_SG_SST: "Auditoría SG-SST",
  RESCATISTA: "Rescatista",
  TAPH_PARAMEDICO: "TAPH (Paramédico)",
  AUXILIAR_OPERATIVO: "Auxiliar Operativo",
  SERVICIOS_ADMINISTRATIVOS: "Servicios Administrativos",
};

export default function ServicesList() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [selectedStatus, searchQuery, services]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/services/my-services");
      const data = await response.json();
      if (response.ok) {
        setServices(data.services);
        setFilteredServices(data.services);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    if (selectedStatus !== "ALL") {
      filtered = filtered.filter((s) => s.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.empresaContratante.toLowerCase().includes(query) ||
          s.client.name.toLowerCase().includes(query) ||
          s.municipio.toLowerCase().includes(query)
      );
    }

    setFilteredServices(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card variant="cyber">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Búsqueda */}
          <div>
            <input
              type="text"
              placeholder="Buscar por empresa, cliente o municipio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Filtro por estado */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="ALL">Todos los estados</option>
              <option value="PENDING">Pendientes</option>
              <option value="ASSIGNED">Asignados</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="COMPLETED">Completados</option>
              <option value="CANCELLED">Cancelados</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Mostrando {filteredServices.length} de {services.length} servicios
          </p>
          <Button variant="primary" size="sm">
            Exportar CSV
          </Button>
        </div>
      </Card>

      {/* Lista de servicios */}
      <Card variant="cyber">
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No se encontraron servicios</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {service.empresaContratante}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          statusConfig[
                            service.status as keyof typeof statusConfig
                          ]?.color
                        }`}
                      >
                        {
                          statusConfig[
                            service.status as keyof typeof statusConfig
                          ]?.label
                        }
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {serviceTypeNames[service.serviceType] ||
                        service.serviceType}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-gray-500">Cliente</p>
                    <p className="text-white">{service.client.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Municipio</p>
                    <p className="text-white">{service.municipio}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Fecha Inicio</p>
                    <p className="text-white">
                      {formatDate(service.fechaInicio)}
                    </p>
                  </div>
                  {service.employee && (
                    <div>
                      <p className="text-gray-500">Empleado</p>
                      <p className="text-white">{service.employee.name}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => {
                      setSelectedServiceId(service.id);
                      setIsModalOpen(true);
                    }}
                  >
                    Ver Detalles
                  </Button>
                  {service.status === "PENDING" && (
                    <Button variant="primary" size="sm">
                      Asignar
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal de detalles del servicio */}
      <ServiceDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedServiceId("");
        }}
        serviceId={selectedServiceId}
      />
    </div>
  );
}
