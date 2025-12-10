import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status")

        let whereClause: any = {}

        if (session.user.role === "CLIENTE") {
            whereClause.clientId = session.user.id
        } else if (session.user.role === "EMPLEADO") {
            whereClause.employeeId = session.user.id
        } else if (session.user.role === "ADMINISTRADOR") {
            whereClause = {}
        } else {
            return NextResponse.json(
                { error: "Rol no autorizado" },
                { status: 403 }
            )
        }

        if (status) {
            whereClause.status = status
        }

        const services = await prisma.service.findMany({
            where: whereClause,
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                employee: {
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
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        const stats = await prisma.service.groupBy({
            by: ["status"],
            where: whereClause,
            _count: {
                status: true,
            },
        })

        const statsFormatted = stats.reduce((acc, curr) => {
            acc[curr.status] = curr._count.status
            return acc
        }, {} as Record<string, number>)

        return NextResponse.json({
            services,
            stats: {
                pending: statsFormatted.PENDING || 0,
                assigned: statsFormatted.ASSIGNED || 0,
                inProgress: statsFormatted.IN_PROGRESS || 0,
                completed: statsFormatted.COMPLETED || 0,
                cancelled: statsFormatted.CANCELLED || 0,
                postponed: statsFormatted.POSTPONED || 0,
                reopened: statsFormatted.REOPENED || 0,
                total: services.length,
            },
        })
    } catch (error) {
        console.error("Error fetching services:", error)
        return NextResponse.json(
            { error: "Error al obtener los servicios" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            )
        }

        const body = await request.json()

        // Validar campos requeridos
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

        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { error: `El campo ${field} es requerido` },
                    { status: 400 }
                )
            }
        }

        // Crear el servicio
        const service = await prisma.service.create({
            data: {
                // Campos originales
                serviceType: body.serviceType,
                description: body.description,
                address: body.address || null,
                contactPerson: body.contactPerson,
                contactPhone: body.contactPhone,
                suggestedDate: new Date(body.fechaInicio),

                // Nuevos campos
                empresaContratante: body.empresaContratante,
                personaSolicita: body.personaSolicita,
                cantidadRequerida: parseInt(body.cantidadRequerida),
                equiposUtilizar: body.equiposUtilizar,
                herramientasUtilizar: body.herramientasUtilizar,
                maquinasUtilizar: body.maquinasUtilizar,
                numeroTrabajadores: parseInt(body.numeroTrabajadores),
                municipio: body.municipio,
                empresaPrestacionServicio: body.empresaPrestacionServicio,
                fechaInicio: new Date(body.fechaInicio),
                fechaTerminacion: new Date(body.fechaTerminacion),
                horarioEjecucion: body.horarioEjecucion,

                // Relaciones
                clientId: session.user.id,
                createdById: session.user.id,

                // Estado inicial
                status: 'PENDING'
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
                        role: true,
                    },
                },
            },
        })

        // Crear notificación para administradores
        const admins = await prisma.user.findMany({
            where: { role: 'ADMINISTRADOR', active: true },
            select: { id: true }
        })

        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    title: 'Nueva solicitud de servicio',
                    message: `${body.personaSolicita} ha creado una nueva solicitud de servicio: ${body.serviceType}`,
                    type: 'service_created',
                    data: {
                        serviceId: service.id,
                        serviceType: body.serviceType
                    }
                }))
            })
        }

        // Registrar en log de actividades
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: 'created_service',
                entity: 'service',
                entityId: service.id,
                details: {
                    serviceType: body.serviceType,
                    empresaContratante: body.empresaContratante,
                    municipio: body.municipio
                }
            }
        })

        return NextResponse.json({
            success: true,
            service,
            message: 'Servicio creado exitosamente'
        }, { status: 201 })

    } catch (error) {
        console.error("Error creating service:", error)
        return NextResponse.json(
            { error: "Error al crear el servicio" },
            { status: 500 }
        )
    }
}