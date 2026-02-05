'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download } from 'lucide-react'
import { format } from 'date-fns'

interface InvoiceItem {
    id: string
    quantity: number
    price: string
    total: string
    service: {
        id: string
        name: string
        description: string | null
    }
}

interface Invoice {
    id: string
    invoiceNumber: string
    total: string
    status: string
    issuedAt: string
    paidAt: string | null
    client: {
        id: string
        name: string
        email: string | null
        phone: string | null
        address: string | null
    }
    items: InvoiceItem[]
}

export default function InvoiceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { data: session } = useSession()
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchInvoice()
    }, [params.id])

    const fetchInvoice = async () => {
        try {
            const response = await fetch('/api/invoices')
            if (response.ok) {
                const invoices = await response.json()
                const found = invoices.find((inv: Invoice) => inv.id === params.id)
                setInvoice(found || null)
            }
        } catch (error) {
            console.error('Failed to fetch invoice:', error)
        } finally {
            setLoading(false)
        }
    }

    const togglePaymentStatus = async () => {
        if (!invoice) return

        const newStatus = invoice.status === 'paid' ? 'unpaid' : 'paid'

        try {
            const response = await fetch('/api/invoices', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: invoice.id, status: newStatus }),
            })

            if (response.ok) {
                fetchInvoice()
            }
        } catch (error) {
            console.error('Failed to update payment status:', error)
        }
    }

    const downloadPDF = () => {
        if (!invoice) return

        // Create a new window for printing
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
            alert('Please allow popups for this website to download the PDF')
            return
        }

        const businessName = session?.user?.businessName || 'Your Business'
        const businessEmail = session?.user?.email || ''

        // Generate clean HTML for the invoice
        const invoiceHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${invoice.invoiceNumber} - Invoice</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1f2937; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
                    .invoice-title { font-size: 32px; font-weight: bold; color: #111827; }
                    .invoice-number { color: #6b7280; margin-top: 8px; }
                    .business-name { font-size: 20px; font-weight: bold; text-align: right; }
                    .business-email { color: #6b7280; font-size: 14px; }
                    .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 24px; }
                    .status.paid { background: #d1fae5; color: #065f46; }
                    .status.unpaid { background: #ffedd5; color: #c2410c; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid #e5e7eb; }
                    .label { font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 4px; }
                    .value { color: #111827; }
                    .text-right { text-align: right; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
                    th { text-align: left; padding: 12px 0; border-bottom: 2px solid #e5e7eb; font-size: 12px; font-weight: 600; color: #6b7280; }
                    th.text-center { text-align: center; }
                    th.text-right { text-align: right; }
                    td { padding: 16px 0; border-bottom: 1px solid #e5e7eb; }
                    td.text-center { text-align: center; }
                    td.text-right { text-align: right; }
                    .service-name { font-weight: 500; }
                    .service-desc { font-size: 14px; color: #6b7280; }
                    .total-row { display: flex; justify-content: flex-end; }
                    .total-box { width: 250px; padding-top: 16px; border-top: 2px solid #111827; display: flex; justify-content: space-between; align-items: center; }
                    .total-label { font-size: 18px; font-weight: bold; }
                    .total-value { font-size: 24px; font-weight: bold; }
                    .footer { margin-top: 48px; padding-top: 32px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="invoice-title">INVOICE</div>
                        <div class="invoice-number">${invoice.invoiceNumber}</div>
                    </div>
                    <div>
                        <div class="business-name">${businessName}</div>
                        <div class="business-email">${businessEmail}</div>
                    </div>
                </div>

                <div class="status ${invoice.status}">${invoice.status.toUpperCase()}</div>

                <div class="info-grid">
                    <div>
                        <div class="label">BILL TO</div>
                        <div class="value" style="font-weight: 600;">${invoice.client.name}</div>
                        ${invoice.client.email ? `<div class="value" style="font-size: 14px;">${invoice.client.email}</div>` : ''}
                        ${invoice.client.phone ? `<div class="value" style="font-size: 14px;">${invoice.client.phone}</div>` : ''}
                        ${invoice.client.address ? `<div class="value" style="font-size: 14px;">${invoice.client.address}</div>` : ''}
                    </div>
                    <div class="text-right">
                        <div class="label">ISSUE DATE</div>
                        <div class="value">${new Date(invoice.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        ${invoice.paidAt ? `
                            <div class="label" style="margin-top: 16px;">PAID DATE</div>
                            <div class="value">${new Date(invoice.paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        ` : ''}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>SERVICE</th>
                            <th class="text-center">QTY</th>
                            <th class="text-right">PRICE</th>
                            <th class="text-right">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items.map(item => `
                            <tr>
                                <td>
                                    <div class="service-name">${item.service.name}</div>
                                    ${item.service.description ? `<div class="service-desc">${item.service.description}</div>` : ''}
                                </td>
                                <td class="text-center">${item.quantity}</td>
                                <td class="text-right">$${parseFloat(item.price).toFixed(2)}</td>
                                <td class="text-right" style="font-weight: 500;">$${parseFloat(item.total).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="total-row">
                    <div class="total-box">
                        <span class="total-label">TOTAL</span>
                        <span class="total-value">$${parseFloat(invoice.total).toFixed(2)}</span>
                    </div>
                </div>

                <div class="footer">
                    <p>Thank you for your business!</p>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `

        printWindow.document.write(invoiceHTML)
        printWindow.document.close()
    }

    if (loading) {
        return (
            <>
                <TopBar title="Invoice Details" />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="text-center py-12 text-gray-500">Loading...</div>
                </main>
            </>
        )
    }

    if (!invoice) {
        return (
            <>
                <TopBar title="Invoice Details" />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="text-center py-12 text-gray-500">Invoice not found</div>
                </main>
            </>
        )
    }

    return (
        <>
            <TopBar title="Invoice Details" />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/invoices')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Invoices
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={downloadPDF}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                        <Button
                            onClick={togglePaymentStatus}
                            variant={invoice.status === 'paid' ? 'outline' : 'default'}
                        >
                            Mark as {invoice.status === 'paid' ? 'Unpaid' : 'Paid'}
                        </Button>
                    </div>
                </div>

                <Card className="max-w-4xl mx-auto">
                    <CardContent className="p-8">
                        {/* Invoice Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                                <p className="text-gray-600">{invoice.invoiceNumber}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    {session?.user?.businessName || 'Your Business'}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {session?.user?.email}
                                </p>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-8">
                            <span
                                className={`px-4 py-2 rounded-full text-sm font-medium ${invoice.status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-orange-100 text-orange-800'
                                    }`}
                            >
                                {invoice.status.toUpperCase()}
                            </span>
                        </div>

                        {/* Client and Date Info */}
                        <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">BILL TO</h3>
                                <p className="font-semibold text-gray-900">{invoice.client.name}</p>
                                {invoice.client.email && (
                                    <p className="text-sm text-gray-600">{invoice.client.email}</p>
                                )}
                                {invoice.client.phone && (
                                    <p className="text-sm text-gray-600">{invoice.client.phone}</p>
                                )}
                                {invoice.client.address && (
                                    <p className="text-sm text-gray-600">{invoice.client.address}</p>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-gray-600">ISSUE DATE</p>
                                    <p className="text-gray-900">
                                        {format(new Date(invoice.issuedAt), 'MMMM dd, yyyy')}
                                    </p>
                                </div>
                                {invoice.paidAt && (
                                    <div>
                                        <p className="text-sm font-semibold text-gray-600">PAID DATE</p>
                                        <p className="text-gray-900">
                                            {format(new Date(invoice.paidAt), 'MMMM dd, yyyy')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Invoice Items */}
                        <div className="mb-8">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 text-sm font-semibold text-gray-600">
                                            SERVICE
                                        </th>
                                        <th className="text-center py-3 text-sm font-semibold text-gray-600">
                                            QTY
                                        </th>
                                        <th className="text-right py-3 text-sm font-semibold text-gray-600">
                                            PRICE
                                        </th>
                                        <th className="text-right py-3 text-sm font-semibold text-gray-600">
                                            TOTAL
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="py-4">
                                                <p className="font-medium text-gray-900">{item.service.name}</p>
                                                {item.service.description && (
                                                    <p className="text-sm text-gray-600">{item.service.description}</p>
                                                )}
                                            </td>
                                            <td className="text-center py-4 text-gray-900">{item.quantity}</td>
                                            <td className="text-right py-4 text-gray-900">
                                                ${parseFloat(item.price).toFixed(2)}
                                            </td>
                                            <td className="text-right py-4 font-medium text-gray-900">
                                                ${parseFloat(item.total).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Total */}
                        <div className="flex justify-end">
                            <div className="w-64">
                                <div className="flex justify-between items-center py-4 border-t-2 border-gray-900">
                                    <span className="text-lg font-bold text-gray-900">TOTAL</span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        ${parseFloat(invoice.total).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-500">
                            <p>Thank you for your business!</p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    )
}
