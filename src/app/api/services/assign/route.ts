import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
    try {
        // Verificar autenticación
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            )
        }

        // Solo administradores pueden asignar servicios
        if (session.user.role !== "ADMINISTRADOR") {
            return NextResponse.json(
                { error: "No tienes permisos para asignar servicios" },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { serviceId, employeeId } = body

        // Validaciones
        if (!serviceId || !employeeId) {
            return NextResponse.json(
                { error: "serviceId y employeeId son requeridos" },
                { status: 400 }
            )
        }

        // Verificar que el servicio existe y está en estado PENDING
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: {
                client: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        })

        if (!service) {
            return NextResponse.json(
                { error: "Servicio no encontrado" },
                { status: 404 }
            )
        }

        if (service.status !== "PENDING") {
            return NextResponse.json(
                { error: "Este servicio ya fue asignado o no está disponible" },
                { status: 400 }
            )
        }

        // Verificar que el empleado existe y está activo
        const employee = await prisma.user.findUnique({
            where: {
                id: employeeId,
                role: "EMPLEADO",
                active: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        })

        if (!employee) {
            return NextResponse.json(
                { error: "Empleado no encontrado o no está activo" },
                { status: 404 }
            )
        }

        // Asignar el servicio al empleado
        // Cambiar estado de PENDING a ASSIGNED
        const updatedService = await prisma.service.update({
            where: { id: serviceId },
            data: {
                employeeId: employeeId,
                status: "ASSIGNED",
            },
            include: {
                client: true,
                employee: true,
            },
        })

        // Crear notificación para el empleado
        await prisma.notification.create({
            data: {
                userId: employeeId,
                title: "Nuevo Servicio Asignado",
                message: `Se te ha asignado un servicio de tipo ${getServiceTypeName(service.serviceType)} para el cliente ${service.client.name}`,
                type: "service_assigned",
                data: {
                    serviceId: service.id,
                    serviceType: service.serviceType,
                    clientName: service.client.name,
                    address: service.address,
                    suggestedDate: service.suggestedDate,
                },
            },
        })

        // Crear notificación para el cliente
        await prisma.notification.create({
            data: {
                userId: service.clientId,
                title: "Servicio Asignado",
                message: `Tu solicitud de ${getServiceTypeName(service.serviceType)} ha sido asignada a ${employee.name}`,
                type: "service_assigned_to_client",
                data: {
                    serviceId: service.id,
                    employeeName: employee.name,
                    employeeEmail: employee.email,
                },
            },
        })

        // Registrar actividad en el log
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "assigned_service",
                entity: "service",
                entityId: service.id,
                details: {
                    serviceType: service.serviceType,
                    employeeId: employeeId,
                    employeeName: employee.name,
                    previousStatus: "PENDING",
                    newStatus: "ASSIGNED",
                },
            },
        })

        return NextResponse.json(
            {
                message: "Servicio asignado exitosamente",
                service: {
                    id: updatedService.id,
                    status: updatedService.status,
                    employee: {
                        id: employee.id,
                        name: employee.name,
                        email: employee.email,
                    },
                },
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error assigning service:", error)
        return NextResponse.json(
            { error: "Error al asignar el servicio. Por favor intenta de nuevo." },
            { status: 500 }
        )
    }
}

// Helper function para obtener el nombre legible del tipo de servicio
function getServiceTypeName(type: string): string {
    const names: { [key: string]: string } = {
        PROFESIONAL_SST: "Profesional SST",
        TECNOLOGO_SST: "Tecnólogo SST",
        TECNICO_SST: "Técnico SST",
        COORDINADOR_ALTURAS: "Coordinador de Alturas",
        SUPERVISOR_ESPACIOS_CONFINADOS: "Supervisor Espacios Confinados",
        CAPACITACIONES_CURSOS: "Capacitaciones o Cursos",
        ALQUILER_EQUIPOS: "Alquiler de Equipos",
        ANDAMIERO: "Andamiero",
        AUDITORIA_SG_SST: "Auditoría SG-SST",
        RESCATISTA: "Rescatista",
        TAPH_PARAMEDICO: "TAPH (Paramédico)",
        AUXILIAR_OPERATIVO: "Auxiliar Operativo",
        SERVICIOS_ADMINISTRATIVOS: "Servicios Administrativos",
        NOMINA: "Nómina",
        FACTURACION: "Facturación",
        CONTRATOS: "Contratos",
        SEGURIDAD_SOCIAL: "Seguridad Social",
        OTRO: "Otro",
    }
    return names[type] || type
}