import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signupSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = signupSchema.parse(body)

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await hash(validatedData.password, 12)

        // Create business and user in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create business
            const business = await tx.business.create({
                data: {
                    name: validatedData.businessName,
                },
            })

            // Create user
            const user = await tx.user.create({
                data: {
                    email: validatedData.email,
                    password: hashedPassword,
                    name: validatedData.name,
                    businessId: business.id,
                    role: 'owner',
                },
            })

            return { business, user }
        })

        return NextResponse.json(
            {
                message: 'Account created successfully',
                userId: result.user.id,
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Signup error:', error)

        // Handle Zod validation errors with detailed messages
        if (error && typeof error === 'object' && 'issues' in error) {
            const zodError = error as { issues: Array<{ path: string[]; message: string }> }
            const errorMessages = zodError.issues.map(issue => issue.message).join(', ')
            return NextResponse.json(
                { error: errorMessages },
                { status: 400 }
            )
        }

        // Handle Prisma unique constraint violations
        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as { code: string; meta?: { target?: string[] } }
            if (prismaError.code === 'P2002') {
                return NextResponse.json(
                    { error: 'An account with this email already exists' },
                    { status: 400 }
                )
            }
        }

        // Handle generic errors
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message || 'An error occurred during signup' },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { error: 'An unexpected error occurred during signup' },
            { status: 500 }
        )
    }
}
