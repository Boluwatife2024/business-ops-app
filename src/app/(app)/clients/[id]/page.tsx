'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail, Phone, MapPin, FileText, Calendar } from 'lucide-react'

interface Client {
    id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
    createdAt: string
}

interface Invoice {
    id: string
    invoiceNumber: string
    clientId: string
    total: number
    status: string
    issuedAt: string
    createdAt: string
}

interface Booking {
    id: string
    clientId: string
    serviceId: string
    date: string
    status: string
    notes: string | null
    service?: {
        name: string
    }
}

export default function ClientDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [client, setClient] = useState<Client | null>(null)
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [params.id])

    const fetchData = async () => {
        try {
            // Fetch client
            const clientsRes = await fetch('/api/clients')
            if (clientsRes.ok) {
                const clients = await clientsRes.json()
                const found = clients.find((c: Client) => c.id === params.id)
                setClient(found || null)
            }

            // Fetch invoices for this client
            const invoicesRes = await fetch('/api/invoices')
            if (invoicesRes.ok) {
                const allInvoices = await invoicesRes.json()
                const clientInvoices = Array.isArray(allInvoices)
                    ? allInvoices.filter((inv: Invoice) => inv.clientId === params.id)
                    : []
                setInvoices(clientInvoices)
            }

            // Fetch bookings for this client
            const bookingsRes = await fetch('/api/bookings')
            if (bookingsRes.ok) {
                const allBookings = await bookingsRes.json()
                const clientBookings = Array.isArray(allBookings)
                    ? allBookings.filter((b: Booking) => b.clientId === params.id)
                    : []
                setBookings(clientBookings)
            }
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'pending':
            case 'scheduled':
                return 'bg-yellow-100 text-yellow-800'
            case 'overdue':
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading) {
        return (
            <>
                <TopBar title="Client Details" />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="text-center py-12 text-gray-500">Loading...</div>
                </main>
            </>
        )
    }

    if (!client) {
        return (
            <>
                <TopBar title="Client Details" />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="text-center py-12 text-gray-500">Client not found</div>
                </main>
            </>
        )
    }

    return (
        <>
            <TopBar title="Client Details" />
            <main className="flex-1 overflow-y-auto p-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/clients')}
                    className="mb-6"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Clients
                </Button>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Client Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{client.name}</h3>
                            </div>
                            {client.email && (
                                <div className="flex items-center text-gray-600">
                                    <Mail className="h-4 w-4 mr-2" />
                                    {client.email}
                                </div>
                            )}
                            {client.phone && (
                                <div className="flex items-center text-gray-600">
                                    <Phone className="h-4 w-4 mr-2" />
                                    {client.phone}
                                </div>
                            )}
                            {client.address && (
                                <div className="flex items-start text-gray-600">
                                    <MapPin className="h-4 w-4 mr-2 mt-1" />
                                    {client.address}
                                </div>
                            )}
                            <div className="pt-4 border-t">
                                <p className="text-sm text-gray-500">
                                    Client since {new Date(client.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Booking History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Booking History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {bookings.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No bookings yet
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {bookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {booking.service?.name || 'Service'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(booking.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Invoice History */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Invoice History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {invoices.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No invoices yet
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {invoices.map((invoice) => (
                                        <div
                                            key={invoice.id}
                                            onClick={() => router.push(`/invoices/${invoice.id}`)}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{invoice.invoiceNumber}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Issued: {new Date(invoice.issuedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="font-semibold">${invoice.total.toLocaleString()}</p>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                                    {invoice.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    )
}
