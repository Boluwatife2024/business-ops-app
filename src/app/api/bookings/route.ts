import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET all bookings for the authenticated business
export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const bookings = await prisma.booking.findMany({
            where: {
                businessId: session.user.businessId,
            },
            include: {
                client: true,
                service: true,
            },
            orderBy: {
                scheduledAt: 'desc',
            },
        })

        return NextResponse.json(bookings)
    } catch (error) {
        console.error('Get bookings error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch bookings' },
            { status: 500 }
        )
    }
}

// POST create a new booking
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { clientId, serviceId, scheduledAt, status, notes } = body

        // Verify client and service belong to business
        const [client, service] = await Promise.all([
            prisma.client.findFirst({
                where: { id: clientId, businessId: session.user.businessId },
            }),
            prisma.service.findFirst({
                where: { id: serviceId, businessId: session.user.businessId },
            }),
        ])

        if (!client || !service) {
            return NextResponse.json(
                { error: 'Client or service not found' },
                { status: 404 }
            )
        }

        const booking = await prisma.booking.create({
            data: {
                clientId,
                serviceId,
                businessId: session.user.businessId,
                scheduledAt: new Date(scheduledAt),
                status: status || 'scheduled',
                notes,
            },
            include: {
                client: true,
                service: true,
            },
        })

        return NextResponse.json(booking, { status: 201 })
    } catch (error) {
        console.error('Create booking error:', error)
        return NextResponse.json(
            { error: 'Failed to create booking' },
            { status: 500 }
        )
    }
}

// PUT update a booking
export async function PUT(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { id, clientId, serviceId, scheduledAt, status, notes } = body

        // Verify booking belongs to business
        const existingBooking = await prisma.booking.findFirst({
            where: {
                id,
                businessId: session.user.businessId,
            },
        })

        if (!existingBooking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            )
        }

        const booking = await prisma.booking.update({
            where: { id },
            data: {
                clientId,
                serviceId,
                scheduledAt: new Date(scheduledAt),
                status,
                notes,
            },
            include: {
                client: true,
                service: true,
            },
        })

        return NextResponse.json(booking)
    } catch (error) {
        console.error('Update booking error:', error)
        return NextResponse.json(
            { error: 'Failed to update booking' },
            { status: 500 }
        )
    }
}

// DELETE a booking
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
                { error: 'Booking ID is required' },
                { status: 400 }
            )
        }

        // Verify booking belongs to business
        const existingBooking = await prisma.booking.findFirst({
            where: {
                id,
                businessId: session.user.businessId,
            },
        })

        if (!existingBooking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            )
        }

        await prisma.booking.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Booking deleted successfully' })
    } catch (error) {
        console.error('Delete booking error:', error)
        return NextResponse.json(
            { error: 'Failed to delete booking' },
            { status: 500 }
        )
    }
}
