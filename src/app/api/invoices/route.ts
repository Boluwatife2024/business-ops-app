import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET all invoices for the authenticated business
export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const invoices = await prisma.invoice.findMany({
            where: {
                businessId: session.user.businessId,
            },
            include: {
                client: true,
                items: {
                    include: {
                        service: true,
                    },
                },
            },
            orderBy: {
                issuedAt: 'desc',
            },
        })

        return NextResponse.json(invoices)
    } catch (error) {
        console.error('Get invoices error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch invoices' },
            { status: 500 }
        )
    }
}

// POST create a new invoice
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { clientId, items } = body

        // Verify client belongs to business
        const client = await prisma.client.findFirst({
            where: { id: clientId, businessId: session.user.businessId },
        })

        if (!client) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            )
        }

        // Verify all services belong to business and calculate total
        let total = 0
        const serviceIds = items.map((item: any) => item.serviceId)
        const services = await prisma.service.findMany({
            where: {
                id: { in: serviceIds },
                businessId: session.user.businessId,
            },
        })

        if (services.length !== serviceIds.length) {
            return NextResponse.json(
                { error: 'One or more services not found' },
                { status: 404 }
            )
        }

        // Calculate total and prepare invoice items
        const invoiceItems = items.map((item: any) => {
            const service = services.find((s) => s.id === item.serviceId)!
            const price = parseFloat(service.price.toString())
            const itemTotal = price * item.quantity
            total += itemTotal

            return {
                serviceId: item.serviceId,
                quantity: item.quantity,
                price,
                total: itemTotal,
            }
        })

        // Generate invoice number
        const invoiceCount = await prisma.invoice.count({
            where: { businessId: session.user.businessId },
        })
        const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(5, '0')}`

        // Create invoice with items
        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                clientId,
                businessId: session.user.businessId,
                total,
                status: 'unpaid',
                items: {
                    create: invoiceItems,
                },
            },
            include: {
                client: true,
                items: {
                    include: {
                        service: true,
                    },
                },
            },
        })

        return NextResponse.json(invoice, { status: 201 })
    } catch (error) {
        console.error('Create invoice error:', error)
        return NextResponse.json(
            { error: 'Failed to create invoice' },
            { status: 500 }
        )
    }
}

// PUT update invoice (mainly for payment status)
export async function PUT(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { id, status } = body

        // Verify invoice belongs to business
        const existingInvoice = await prisma.invoice.findFirst({
            where: {
                id,
                businessId: session.user.businessId,
            },
        })

        if (!existingInvoice) {
            return NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            )
        }

        const invoice = await prisma.invoice.update({
            where: { id },
            data: {
                status,
                paidAt: status === 'paid' ? new Date() : null,
            },
            include: {
                client: true,
                items: {
                    include: {
                        service: true,
                    },
                },
            },
        })

        return NextResponse.json(invoice)
    } catch (error) {
        console.error('Update invoice error:', error)
        return NextResponse.json(
            { error: 'Failed to update invoice' },
            { status: 500 }
        )
    }
}

// DELETE an invoice
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
                { error: 'Invoice ID is required' },
                { status: 400 }
            )
        }

        // Verify invoice belongs to business
        const existingInvoice = await prisma.invoice.findFirst({
            where: {
                id,
                businessId: session.user.businessId,
            },
        })

        if (!existingInvoice) {
            return NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            )
        }

        await prisma.invoice.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Invoice deleted successfully' })
    } catch (error) {
        console.error('Delete invoice error:', error)
        return NextResponse.json(
            { error: 'Failed to delete invoice' },
            { status: 500 }
        )
    }
}
