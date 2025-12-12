import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AssignedServices from "@/components/dashboard/employee/AssignedServices";

export default async function AssignedServicesPage() {
  const session = await auth();

  if (!session || session.user.role !== "EMPLEADO") {
    redirect("/login");
  }

  // Obtener servicios ASIGNADOS al empleado
  const services = await prisma.service.findMany({
    where: {
      employeeId: session.user.id,
      status: "ASSIGNED",
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      documents: true,
      inspections: true,
    },
    orderBy: {
      fechaInicio: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Servicios Asignados
        </h1>
        <p className="text-gray-400">
          Servicios pendientes de iniciar - Total: {services.length}
        </p>
      </div>

      <AssignedServices services={services} />
    </div>
  );
}
