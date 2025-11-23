import { PrismaClient, ServiceType, DocumentType, InspectionType } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Iniciando seeding...')

    const hashedPassword = await hash('password123', 12)

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@sst.com' },
        update: {},
        create: {
            email: 'admin@sst.com',
            password: hashedPassword,
            name: 'Administrador Principal',
            phone: '+57 300 111 1111',
            role: 'ADMINISTRADOR',
            active: true,
        },
    })

    // Employee
    const employee = await prisma.user.upsert({
        where: { email: 'empleado@sst.com' },
        update: {},
        create: {
            email: 'empleado@sst.com',
            password: hashedPassword,
            name: 'Carlos Trabajador',
            phone: '+57 300 222 2222',
            role: 'EMPLEADO',
            active: true,
        },
    })

    // Client
    const client = await prisma.user.upsert({
        where: { email: 'cliente@empresa.com' },
        update: {},
        create: {
            email: 'cliente@empresa.com',
            password: hashedPassword,
            name: 'María Cliente',
            phone: '+57 300 333 3333',
            role: 'CLIENTE',
            active: true,
        },
    })

    // Service Configurations
    const serviceConfigs = [
        {
            serviceType: ServiceType.COORDINADOR_ALTURAS,
            requiredDocs: [
                DocumentType.CHARLA_SEGURIDAD,
                DocumentType.ATS,
                DocumentType.PERMISO_TRABAJO,
                DocumentType.PERMISO_ALTURAS
            ],
            requiredInspections: [
                InspectionType.ARNES,
                InspectionType.ESLINGA,
                InspectionType.ESCALERA,
                InspectionType.LINEA_VIDA
            ],
            description: 'Coordinación de trabajos en alturas',
        },
        {
            serviceType: ServiceType.SUPERVISOR_ESPACIOS_CONFINADOS,
            requiredDocs: [
                DocumentType.CHARLA_SEGURIDAD,
                DocumentType.ATS,
                DocumentType.PERMISO_TRABAJO,
                DocumentType.PERMISO_ESPACIOS_CONFINADOS
            ],
            requiredInspections: [
                InspectionType.MEDICION_GASES,
                InspectionType.TRIPODE,
                InspectionType.LINEA_VIDA,
                InspectionType.VENTILACION,
                InspectionType.EQUIPO_RESCATE
            ],
            description: 'Supervisión de espacios confinados',
        },
        {
            serviceType: ServiceType.SERVICIOS_ADMINISTRATIVOS,
            requiredDocs: [
                DocumentType.CHARLA_SEGURIDAD
            ],
            requiredInspections: [
                InspectionType.CARGA_DOCUMENTOS,
                InspectionType.VALIDACION_SOPORTES,
                InspectionType.CHECKLIST_CUMPLIMIENTO
            ],
            description: 'Servicios administrativos generales',
        },
    ]

    for (const config of serviceConfigs) {
        await prisma.serviceConfiguration.upsert({
            where: { serviceType: config.serviceType },
            update: {},
            create: {
                serviceType: config.serviceType,
                requiredDocs: config.requiredDocs,
                requiredInspections: config.requiredInspections,
                description: config.description,
            },
        })
    }

    console.log('🎉 Seeding completado exitosamente!')
}

main()
    .catch((e) => {
        console.error('❌ Error durante el seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
