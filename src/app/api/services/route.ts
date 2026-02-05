import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { serviceSchema } from '@/lib/validations'

// GET all services for the authenticated business
export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const services = await prisma.service.findMany({
            where: {
                businessId: session.user.businessId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json(services)
    } catch (error) {
        console.error('Get services error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch services' },
            { status: 500 }
        )
    }
}

// POST create a new service
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = serviceSchema.parse(body)

        const service = await prisma.service.create({
            data: {
                ...validatedData,
                businessId: session.user.businessId,
            },
        })

        return NextResponse.json(service, { status: 201 })
    } catch (error) {
        console.error('Create service error:', error)

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input data' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to create service' },
            { status: 500 }
        )
    }
}

// PUT update a service
export async function PUT(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { id, ...data } = body
        const validatedData = serviceSchema.parse(data)

        // Verify service belongs to business
        const existingService = await prisma.service.findFirst({
            where: {
                id,
                businessId: session.user.businessId,
            },
        })

        if (!existingService) {
            return NextResponse.json(
                { error: 'Service not found' },
                { status: 404 }
            )
        }

        const service = await prisma.service.update({
            where: { id },
            data: validatedData,
        })

        return NextResponse.json(service)
    } catch (error) {
        console.error('Update service error:', error)
        return NextResponse.json(
            { error: 'Failed to update service' },
            { status: 500 }
        )
    }
}

// DELETE a service
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'Service ID is required' },
                { status: 400 }
            )
        }

        // Verify service belongs to business
        const existingService = await prisma.service.findFirst({
            where: {
                id,
                businessId: session.user.businessId,
            },
        })

        if (!existingService) {
            return NextResponse.json(
                { error: 'Service not found' },
                { status: 404 }
            )
        }

        await prisma.service.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Service deleted successfully' })
    } catch (error) {
        console.error('Delete service error:', error)
        return NextResponse.json(
            { error: 'Failed to delete service' },
            { status: 500 }
        )
    }
}
