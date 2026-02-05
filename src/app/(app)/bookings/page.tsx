'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, Trash2, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

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
        price: string
    }
}

interface Client {
    id: string
    name: string
}

interface Service {
    id: string
    name: string
    price: string
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
    const [formData, setFormData] = useState({
        clientId: '',
        serviceId: '',
        scheduledAt: '',
        status: 'scheduled',
        notes: '',
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [bookingsRes, clientsRes, servicesRes] = await Promise.all([
                fetch('/api/bookings'),
                fetch('/api/clients'),
                fetch('/api/services'),
            ])

            if (bookingsRes.ok) setBookings(await bookingsRes.json())
            if (clientsRes.ok) setClients(await clientsRes.json())
            if (servicesRes.ok) setServices(await servicesRes.json())
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = '/api/bookings'
            const method = editingBooking ? 'PUT' : 'POST'
            const body = editingBooking
                ? JSON.stringify({ id: editingBooking.id, ...formData })
                : JSON.stringify(formData)

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body,
            })

            if (response.ok) {
                setDialogOpen(false)
                setEditingBooking(null)
                setFormData({
                    clientId: '',
                    serviceId: '',
                    scheduledAt: '',
                    status: 'scheduled',
                    notes: '',
                })
                fetchData()
            }
        } catch (error) {
            console.error('Failed to save booking:', error)
        }
    }

    const handleEdit = (booking: Booking) => {
        setEditingBooking(booking)
        setFormData({
            clientId: booking.client.id,
            serviceId: booking.service.id,
            scheduledAt: format(new Date(booking.scheduledAt), "yyyy-MM-dd'T'HH:mm"),
            status: booking.status,
            notes: booking.notes || '',
        })
        setDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this booking?')) return

        try {
            const response = await fetch(`/api/bookings?id=${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                fetchData()
            }
        } catch (error) {
            console.error('Failed to delete booking:', error)
        }
    }

    const openNewBookingDialog = () => {
        setEditingBooking(null)
        setFormData({
            clientId: '',
            serviceId: '',
            scheduledAt: '',
            status: 'scheduled',
            notes: '',
        })
        setDialogOpen(true)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800'
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <>
            <TopBar title="Bookings" />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">Manage your appointments and bookings</p>
                    <Button data-tour="new-booking-btn" onClick={openNewBookingDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Booking
                    </Button>
                </div>

                <Card data-tour="bookings-table">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Loading...</div>
                        ) : bookings.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No bookings yet. Create your first booking to get started.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookings.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center">
                                                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                                                    {format(new Date(booking.scheduledAt), 'MMM dd, yyyy HH:mm')}
                                                </div>
                                            </TableCell>
                                            <TableCell>{booking.client.name}</TableCell>
                                            <TableCell>{booking.service.name}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(booking)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(booking.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Add/Edit Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingBooking ? 'Edit Booking' : 'New Booking'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingBooking
                                    ? 'Update booking information'
                                    : 'Schedule a new appointment'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="clientId">Client *</Label>
                                <Select
                                    value={formData.clientId}
                                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="serviceId">Service *</Label>
                                <Select
                                    value={formData.serviceId}
                                    onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {services.map((service) => (
                                            <SelectItem key={service.id} value={service.id}>
                                                {service.name} - ${parseFloat(service.price).toFixed(2)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="scheduledAt">Date & Time *</Label>
                                <Input
                                    id="scheduledAt"
                                    type="datetime-local"
                                    value={formData.scheduledAt}
                                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingBooking ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </main>
        </>
    )
}
