"use client";

import { useParams } from "next/navigation";

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceId = params.id as string;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Detalle del Servicio</h1>
      <p className="text-gray-400">Service ID: {serviceId}</p>
    </div>
  );
}
