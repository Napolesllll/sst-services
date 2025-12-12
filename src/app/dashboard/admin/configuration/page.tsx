// app/dashboard/admin/configuration/page.tsx
"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function ConfigurationPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Configuración SG-SST
        </h1>
        <p className="text-gray-400">
          Configura documentos obligatorios e inspecciones por tipo de servicio
        </p>
      </div>

      <Card variant="cyber">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/20 mb-4">
            <svg
              className="w-8 h-8 text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Configuración Avanzada
          </h2>
          <p className="text-gray-400 mb-6">
            Panel de configuración de Sistema de Gestión SST
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Próximamente: Gestión de documentos obligatorios, inspecciones
            preoperacionales,
            <br />y configuración de requisitos por tipo de servicio.
          </p>
          <Button variant="secondary">Volver al Dashboard</Button>
        </div>
      </Card>
    </div>
  );
}
