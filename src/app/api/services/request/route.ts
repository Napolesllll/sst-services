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

        // Solo los clientes pueden crear solicitudes
        if (session.user.role !== "CLIENTE") {
            return NextResponse.json(
                { error: "No tienes permisos para crear solicitudes" },
                { status: 403 }
            )
        }

        const body = await request.json()
        const {
            serviceType,
            description,
            address,
            contactPerson,
            contactPhone,
            suggestedDate,
        } = body

        // Validaciones
        if (!serviceType || !description || !address || !contactPerson || !contactPhone || !suggestedDate) {
            return NextResponse.json(
                { error: "Todos los campos son requeridos" },
                { status: 400 }
            )
        }

        // Validar que el tipo de servicio sea válido
        const validServiceTypes = [
            "PROFESIONAL_SST",
            "TECNOLOGO_SST",
            "TECNICO_SST",
            "COORDINADOR_ALTURAS",
            "SUPERVISOR_ESPACIOS_CONFINADOS",
            "CAPACITACIONES_CURSOS",
            "ALQUILER_EQUIPOS",
            "ANDAMIERO",
            "AUDITORIA_SG_SST",
            "RESCATISTA",
            "TAPH_PARAMEDICO",
            "AUXILIAR_OPERATIVO",
            "SERVICIOS_ADMINISTRATIVOS",
            "NOMINA",
            "FACTURACION",
            "CONTRATOS",
            "SEGURIDAD_SOCIAL",
            "OTRO",
        ]

        if (!validServiceTypes.includes(serviceType)) {
            return NextResponse.json(
                { error: "Tipo de servicio inválido" },
                { status: 400 }
            )
        }

        // Crear la solicitud de servicio
        // Estado inicial: PENDING (en espera de asignación)
        // createdById es el mismo que clientId ya que el cliente crea su propia solicitud
        const service = await prisma.service.create({
            data: {
                serviceType,
                description,
                address,
                contactPerson,
                contactPhone,
                suggestedDate: new Date(suggestedDate),
                status: "PENDING", // Estado inicial según tu flujo
                clientId: session.user.id,
                createdById: session.user.id,
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        // Crear una notificación para los administradores
        // (Opcional: puedes obtener todos los administradores y crearles notificaciones)
        const admins = await prisma.user.findMany({
            where: {
                role: "ADMINISTRADOR",
                active: true,
            },
            select: {
                id: true,
            },
        })

        // Crear notificaciones para cada administrador
        const notifications = admins.map((admin) => ({
            userId: admin.id,
            title: "Nueva Solicitud de Servicio",
            message: `${session.user.name} ha solicitado un servicio de tipo ${getServiceTypeName(serviceType)}`,
            type: "service_requested",
            data: {
                serviceId: service.id,
                serviceType,
                clientName: session.user.name,
            },
        }))

        if (notifications.length > 0) {
            await prisma.notification.createMany({
                data: notifications,
            })
        }

        // Registrar actividad en el log
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "created_service_request",
                entity: "service",
                entityId: service.id,
                details: {
                    serviceType,
                    status: "PENDING",
                },
            },
        })

        return NextResponse.json(
            {
                message: "Solicitud creada exitosamente",
                service: {
                    id: service.id,
                    serviceType: service.serviceType,
                    status: service.status,
                    createdAt: service.createdAt,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Error creating service request:", error)
        return NextResponse.json(
            { error: "Error al crear la solicitud. Por favor intenta de nuevo." },
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