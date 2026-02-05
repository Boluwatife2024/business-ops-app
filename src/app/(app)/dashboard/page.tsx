'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, FileText, DollarSign, Clock, User } from 'lucide-react'
import { format } from 'date-fns'

interface DashboardMetrics {
    totalClients: number
    upcomingBookings: number
    unpaidInvoices: number
    monthlyRevenue: number
}

interface Booking {
    id: string
    scheduledAt: string
    status: string
    notes: string | null
    client: {
        id: string
        name: string
    }
    service: {
        id: string
        name: string
        duration: number
    }
}

export default function DashboardPage() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalClients: 0,
        upcomingBookings: 0,
        unpaidInvoices: 0,
        monthlyRevenue: 0,
    })
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)

    // Prevent hydration mismatch by only rendering after mount
    useEffect(() => {
        setMounted(true)
    }, [])

    // Safe date formatter to prevent RangeError on invalid dates
    const safeFormatDate = (dateStr: string, formatStr: string, fallback: string = 'N/A') => {
        try {
            const date = new Date(dateStr)
            if (isNaN(date.getTime())) return fallback
            return format(date, formatStr)
        } catch {
            return fallback
        }
    }

    const fetchMetrics = useCallback(async () => {
        try {
            // Fetch clients count
            const clientsRes = await fetch('/api/clients')
            const clients = await clientsRes.json()
            const totalClients = Array.isArray(clients) ? clients.length : 0

            // Fetch bookings for upcoming count
            const bookingsRes = await fetch('/api/bookings')
            const bookingsData = await bookingsRes.json()
            let upcomingBookingsList: Booking[] = []

            if (Array.isArray(bookingsData)) {
                // Filter for scheduled/upcoming bookings
                upcomingBookingsList = bookingsData
                    .filter((b: Booking) => b.status === 'scheduled')
                    .sort((a: Booking, b: Booking) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                    .slice(0, 5) // Show only 5 most recent
            }

            setBookings(upcomingBookingsList)
            const upcomingBookings = upcomingBookingsList.length

            // Fetch invoices for unpaid count and revenue
            const invoicesRes = await fetch('/api/invoices')
            const invoices = await invoicesRes.json()
            let unpaidInvoices = 0
            let monthlyRevenue = 0

            if (Array.isArray(invoices)) {
                // Count invoices that are unpaid (status is 'unpaid')
                unpaidInvoices = invoices.filter((i: { status: string }) =>
                    i.status === 'unpaid'
                ).length

                // Calculate this month's paid revenue
                const now = new Date()
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                monthlyRevenue = invoices
                    .filter((i: { status: string; paidAt?: string }) =>
                        i.status === 'paid' && i.paidAt && new Date(i.paidAt) >= startOfMonth
                    )
                    .reduce((sum: number, i: { total: string | number }) => {
                        const total = typeof i.total === 'string' ? parseFloat(i.total) : i.total
                        return sum + (total || 0)
                    }, 0)
            }

            setMetrics({
                totalClients,
                upcomingBookings,
                unpaidInvoices,
                monthlyRevenue,
            })
        } catch (error) {
            console.error('Failed to fetch metrics:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchMetrics()

        // Poll for updates every 5 seconds for real-time feel
        const interval = setInterval(fetchMetrics, 5000)
        return () => clearInterval(interval)
    }, [fetchMetrics])

    const metricCards = [
        {
            title: 'Total Clients',
            value: loading ? '...' : metrics.totalClients.toString(),
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Upcoming Bookings',
            value: loading ? '...' : metrics.upcomingBookings.toString(),
            icon: Calendar,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Unpaid Invoices',
            value: loading ? '...' : metrics.unpaidInvoices.toString(),
            icon: FileText,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
        {
            title: 'Monthly Revenue',
            value: loading ? '...' : `$${metrics.monthlyRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
    ]

    return (
        <>
            <TopBar title="Dashboard" />
            <main className="flex-1 overflow-y-auto p-6">
                {!mounted ? (
                    <div className="text-center py-12 text-gray-500">Loading...</div>
                ) : (
                    <>
                        {/* Metrics Grid */}
                        <div data-tour="dashboard-metrics" className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                            {metricCards.map((metric) => {
                                const Icon = metric.icon
                                return (
                                    <Card key={metric.title}>
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-600">
                                                {metric.title}
                                            </CardTitle>
                                            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                                                <Icon className={`h-5 w-5 ${metric.color}`} />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold">{metric.value}</div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>

                        {/* Upcoming Bookings */}
                        <Card data-tour="upcoming-bookings">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Upcoming Bookings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-8 text-gray-500">Loading...</div>
                                ) : bookings.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        No upcoming bookings
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {bookings.map((booking) => (
                                            <div
                                                key={booking.id}
                                                onClick={() => router.push('/bookings')}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-green-100 rounded-full">
                                                        <User className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">
                                                            {booking.client?.name || 'Unknown Client'}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {booking.service?.name || 'Service'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {(() => {
                                                        const bookingDate = new Date(booking.scheduledAt)
                                                        const isPastDue = !isNaN(bookingDate.getTime()) && bookingDate < new Date()
                                                        return (
                                                            <>
                                                                <p className={`font-medium ${isPastDue ? 'text-red-600' : 'text-gray-900'}`}>
                                                                    {safeFormatDate(booking.scheduledAt, 'MMM d, yyyy')}
                                                                    {isPastDue && (
                                                                        <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                                                            Past Due
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                <div className={`flex items-center gap-1 text-sm ${isPastDue ? 'text-red-500' : 'text-gray-500'}`}>
                                                                    <Clock className="h-3 w-3" />
                                                                    {safeFormatDate(booking.scheduledAt, 'h:mm a')}
                                                                    {booking.service?.duration && (
                                                                        <span className="ml-2">• {booking.service.duration} min</span>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )
                                                    })()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </main>
        </>
    )
}
