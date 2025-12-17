import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CompletedServices from "@/components/dashboard/employee/CompletedServices";

export default async function CompletedPage() {
  const session = await auth();

  if (!session || session.user.role !== "EMPLEADO") {
    redirect("/login");
  }

  // Obtener servicios COMPLETADOS
  const servicesRaw = await prisma.service.findMany({
    where: {
      employeeId: session.user.id,
      status: "COMPLETED",
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      documents: true,
      inspections: true,
    },
    orderBy: {
      completedAt: "desc",
    },
    take: 50, // Limitar a los últimos 50
  });

  // Serializar fechas
  const services = servicesRaw.map((s) => ({
    ...s,
    completedAt: s.completedAt?.toISOString() || null,
  }));

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Servicios Completados
        </h1>
        <p className="text-gray-400">
          Historial de servicios finalizados - Total: {services.length}
        </p>
      </div>

      <CompletedServices services={services as any} />
    </div>
  );
}
