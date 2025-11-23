import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password, name, phone, role } = body

        // Validate required fields
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Campos requeridos faltantes' },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Formato de email inválido' },
                { status: 400 }
            )
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'La contraseña debe tener al menos 6 caracteres' },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'El usuario ya existe' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await hash(password, 12)

        // Create user with explicit role
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone: phone || null,
                role: 'CLIENTE', // Explicitly set as CLIENTE enum value
                active: true,
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                active: true,
                createdAt: true,
            },
        })

        return NextResponse.json(
            {
                message: 'Usuario creado exitosamente',
                user,
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Registration error:', error)

        // Handle Prisma specific errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return NextResponse.json(
                    { error: 'El email ya está registrado' },
                    { status: 400 }
                )
            }
        }

        return NextResponse.json(
            { error: 'Error al crear usuario. Por favor intenta de nuevo.' },
            { status: 500 }
        )
    }
}