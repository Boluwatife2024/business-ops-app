import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { clientSchema } from '@/lib/validations'

// GET all clients for the authenticated business
export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const clients = await prisma.client.findMany({
            where: {
                businessId: session.user.businessId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json(clients)
    } catch (error) {
        console.error('Get clients error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch clients' },
            { status: 500 }
        )
    }
}

// POST create a new client
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = clientSchema.parse(body)

        const client = await prisma.client.create({
            data: {
                ...validatedData,
                businessId: session.user.businessId,
            },
        })

        return NextResponse.json(client, { status: 201 })
    } catch (error) {
        console.error('Create client error:', error)

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input data' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to create client' },
            { status: 500 }
        )
    }
}

// PUT update a client
export async function PUT(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { id, ...data } = body
        const validatedData = clientSchema.parse(data)

        // Verify client belongs to business
        const existingClient = await prisma.client.findFirst({
            where: {
                id,
                businessId: session.user.businessId,
            },
        })

        if (!existingClient) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            )
        }

        const client = await prisma.client.update({
            where: { id },
            data: validatedData,
        })

        return NextResponse.json(client)
    } catch (error) {
        console.error('Update client error:', error)
        return NextResponse.json(
            { error: 'Failed to update client' },
            { status: 500 }
        )
    }
}

// DELETE a client
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
                { error: 'Client ID is required' },
                { status: 400 }
            )
        }

        // Verify client belongs to business
        const existingClient = await prisma.client.findFirst({
            where: {
                id,
                businessId: session.user.businessId,
            },
            include: {
                bookings: true,
            },
        })

        if (!existingClient) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            )
        }

        // Check for active bookings
        const activeBookings = existingClient.bookings.filter(
            (b) => b.status === 'scheduled'
        )

        if (activeBookings.length > 0) {
            return NextResponse.json(
                { error: 'Cannot delete client with active bookings' },
                { status: 400 }
            )
        }

        await prisma.client.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Client deleted successfully' })
    } catch (error) {
        console.error('Delete client error:', error)
        return NextResponse.json(
            { error: 'Failed to delete client' },
            { status: 500 }
        )
    }
}
