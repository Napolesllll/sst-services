import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { emitNotificationToAdmins } from "@/lib/websocket/emitNotification"

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

        // VALIDACIONES COMPLETAS según el formulario
        const requiredFields = [
            'empresaContratante',
            'personaSolicita',
            'serviceType',
            'cantidadRequerida',
            'description',
            'equiposUtilizar',
            'herramientasUtilizar',
            'maquinasUtilizar',
            'numeroTrabajadores',
            'municipio',
            'empresaPrestacionServicio',
            'fechaInicio',
            'fechaTerminacion',
            'horarioEjecucion',
            'contactPerson',
            'contactPhone'
        ]

        // Validar campos requeridos
        for (const field of requiredFields) {
            if (body[field] === undefined || body[field] === null || body[field] === '') {
                return NextResponse.json(
                    { error: `El campo ${getFieldName(field)} es requerido` },
                    { status: 400 }
                )
            }
        }

        // Validar cantidades numéricas
        const cantidadRequerida = parseInt(body.cantidadRequerida)
        const numeroTrabajadores = parseInt(body.numeroTrabajadores)

        if (isNaN(cantidadRequerida) || cantidadRequerida <= 0) {
            return NextResponse.json(
                { error: "La cantidad requerida debe ser un número positivo" },
                { status: 400 }
            )
        }

        if (isNaN(numeroTrabajadores) || numeroTrabajadores <= 0) {
            return NextResponse.json(
                { error: "El número de trabajadores debe ser un número positivo" },
                { status: 400 }
            )
        }

        // Validar que el tipo de servicio sea válido
        const validServiceTypes = [
            "PROFESIONAL_SST", "TECNOLOGO_SST", "TECNICO_SST",
            "COORDINADOR_ALTURAS", "SUPERVISOR_ESPACIOS_CONFINADOS",
            "CAPACITACIONES_CURSOS", "ALQUILER_EQUIPOS", "ANDAMIERO",
            "AUDITORIA_SG_SST", "RESCATISTA", "TAPH_PARAMEDICO",
            "AUXILIAR_OPERATIVO", "SERVICIOS_ADMINISTRATIVOS",
            "NOMINA", "FACTURACION", "CONTRATOS", "SEGURIDAD_SOCIAL", "OTRO"
        ]

        if (!validServiceTypes.includes(body.serviceType)) {
            return NextResponse.json(
                { error: "Tipo de servicio inválido" },
                { status: 400 }
            )
        }

        // Validar fechas
        const fechaInicio = new Date(body.fechaInicio)
        const fechaTerminacion = new Date(body.fechaTerminacion)

        if (isNaN(fechaInicio.getTime()) || isNaN(fechaTerminacion.getTime())) {
            return NextResponse.json(
                { error: "Las fechas proporcionadas no son válidas" },
                { status: 400 }
            )
        }

        if (fechaTerminacion < fechaInicio) {
            return NextResponse.json(
                { error: "La fecha de terminación debe ser posterior a la fecha de inicio" },
                { status: 400 }
            )
        }

        // Crear la solicitud de servicio con TODOS los campos
        const service = await prisma.service.create({
            data: {
                // Campos del formulario
                empresaContratante: body.empresaContratante.trim(),
                personaSolicita: body.personaSolicita.trim(),
                serviceType: body.serviceType,
                cantidadRequerida: cantidadRequerida,
                description: body.description.trim(),
                equiposUtilizar: body.equiposUtilizar.trim(),
                herramientasUtilizar: body.herramientasUtilizar.trim(),
                maquinasUtilizar: body.maquinasUtilizar.trim(),
                numeroTrabajadores: numeroTrabajadores,
                municipio: body.municipio.trim(),
                address: body.address ? body.address.trim() : null,
                empresaPrestacionServicio: body.empresaPrestacionServicio.trim(),
                fechaInicio: fechaInicio,
                fechaTerminacion: fechaTerminacion,
                horarioEjecucion: body.horarioEjecucion.trim(),
                contactPerson: body.contactPerson.trim(),
                contactPhone: body.contactPhone.trim(),

                // Campos derivados
                suggestedDate: fechaInicio,

                // Estado y relaciones
                status: "PENDING",
                clientId: session.user.id,
                createdById: session.user.id,
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
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        // Crear notificaciones para administradores
        const admins = await prisma.user.findMany({
            where: {
                role: "ADMINISTRADOR",
                active: true,
            },
            select: {
                id: true,
            },
        })

        if (admins.length > 0) {
            const notificationData = {
                userId: admins[0].id, // Para la estructura
                title: "Nueva Solicitud de Servicio",
                message: `${session.user.name} de ${body.empresaContratante} ha solicitado un servicio de tipo ${getServiceTypeName(body.serviceType)} en ${body.municipio}`,
                type: "service_requested",
                data: {
                    serviceId: service.id,
                    serviceType: body.serviceType,
                    empresaContratante: body.empresaContratante,
                    municipio: body.municipio,
                    fechaInicio: body.fechaInicio,
                },
            }

            const notifications = admins.map((admin) => ({
                ...notificationData,
                userId: admin.id,
            }))

            await prisma.notification.createMany({
                data: notifications,
            })

            // 🔥 ENVIAR VÍA WEBSOCKET
            notifications.forEach(notification => {
                emitNotificationToAdmins({
                    ...notification,
                    id: 'temp-id', // Se generará en DB
                    read: false,
                    createdAt: new Date(),
                })
            })
        }
        // Registrar actividad
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "created_service",
                entity: "service",
                entityId: service.id,
                details: {
                    serviceType: body.serviceType,
                    empresaContratante: body.empresaContratante,
                    municipio: body.municipio,
                    cantidadRequerida: cantidadRequerida,
                    numeroTrabajadores: numeroTrabajadores,
                },
            },
        })

        console.log("✅ Servicio creado exitosamente:", {
            id: service.id,
            empresaContratante: service.empresaContratante,
            serviceType: service.serviceType,
            municipio: service.municipio
        })

        return NextResponse.json(
            {
                success: true,
                message: "Solicitud creada exitosamente",
                service: {
                    id: service.id,
                    serviceType: service.serviceType,
                    status: service.status,
                    empresaContratante: service.empresaContratante,
                    personaSolicita: service.personaSolicita,
                    municipio: service.municipio,
                    createdAt: service.createdAt,
                    fechaInicio: service.fechaInicio,
                    fechaTerminacion: service.fechaTerminacion,
                    client: service.client,
                },
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("❌ Error creating service:", error)

        // Manejar errores específicos de Prisma
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: "Ya existe una solicitud con estos datos" },
                { status: 409 }
            )
        }

        if (error.code === 'P2003') {
            return NextResponse.json(
                { error: "Error de relación con la base de datos" },
                { status: 400 }
            )
        }

        return NextResponse.json(
            {
                error: "Error al crear la solicitud. Por favor intenta de nuevo.",
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        )
    }
}

// Helper functions
function getServiceTypeName(type: string): string {
    const names: Record<string, string> = {
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

function getFieldName(field: string): string {
    const names: Record<string, string> = {
        empresaContratante: "Empresa Contratante",
        personaSolicita: "Persona quien Solicita",
        serviceType: "Tipo de Servicio",
        cantidadRequerida: "Cantidad Requerida",
        description: "Descripción",
        equiposUtilizar: "Equipos a Utilizar",
        herramientasUtilizar: "Herramientas a Utilizar",
        maquinasUtilizar: "Máquinas a Utilizar",
        numeroTrabajadores: "Número de Trabajadores",
        municipio: "Municipio",
        empresaPrestacionServicio: "Empresa donde se Prestará el Servicio",
        fechaInicio: "Fecha de Inicio",
        fechaTerminacion: "Fecha de Terminación",
        horarioEjecucion: "Horario de Ejecución",
        contactPerson: "Coordinador de la Actividad",
        contactPhone: "Teléfono del Coordinador",
    }
    return names[field] || field
}