import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InProgressServices from "@/components/dashboard/employee/InProgressServices";

export default async function InProgressPage() {
  const session = await auth();

  if (!session || session.user.role !== "EMPLEADO") {
    redirect("/login");
  }

  // Obtener servicios EN PROGRESO
  const services = await prisma.service.findMany({
    where: {
      employeeId: session.user.id,
      status: "IN_PROGRESS",
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
      evidences: true,
    },
    orderBy: {
      startDate: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Servicios En Progreso
        </h1>
        <p className="text-gray-400">
          Servicios activos que estás ejecutando - Total: {services.length}
        </p>
      </div>

      <InProgressServices services={services} />
    </div>
  );
}
