import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Solo administradores pueden ver los servicios de un empleado
    if (session.user.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para ver servicios del empleado" },
        { status: 403 }
      );
    }

    const { id: employeeId } = await params;

    // Obtener todos los servicios asignados al empleado
    const services = await prisma.service.findMany({
      where: {
        employeeId: employeeId,
      },
      select: {
        id: true,
        serviceType: true,
        status: true,
        description: true,
        empresaPrestacionServicio: true,
        municipio: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      services,
      total: services.length,
    });
  } catch (error) {
    console.error("Error fetching employee services:", error);
    return NextResponse.json(
      { error: "Error al obtener servicios del empleado" },
      { status: 500 }
    );
  }
}