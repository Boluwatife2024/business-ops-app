import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { contactSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = contactSchema.parse(body)

        // Save contact submission to database
        await prisma.contact.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                message: validatedData.message,
            },
        })

        return NextResponse.json(
            { message: 'Contact form submitted successfully' },
            { status: 201 }
        )
    } catch (error) {
        console.error('Contact form error:', error)

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input data' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'An error occurred' },
            { status: 500 }
        )
    }
}
