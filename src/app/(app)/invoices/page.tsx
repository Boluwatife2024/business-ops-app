'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Label } from '@/components/ui/label'
import { Plus, Eye, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface Invoice {
    id: string
    invoiceNumber: string
    total: string
    status: string
    issuedAt: string
    client: {
        id: string
        name: string
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

export default function InvoicesPage() {
    const router = useRouter()
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        clientId: '',
        items: [{ serviceId: '', quantity: 1 }],
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [invoicesRes, clientsRes, servicesRes] = await Promise.all([
                fetch('/api/invoices'),
                fetch('/api/clients'),
                fetch('/api/services'),
            ])

            if (invoicesRes.ok) setInvoices(await invoicesRes.json())
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
            const response = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                setDialogOpen(false)
                setFormData({
                    clientId: '',
                    items: [{ serviceId: '', quantity: 1 }],
                })
                fetchData()
            }
        } catch (error) {
            console.error('Failed to create invoice:', error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this invoice?')) return

        try {
            const response = await fetch(`/api/invoices?id=${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                fetchData()
            }
        } catch (error) {
            console.error('Failed to delete invoice:', error)
        }
    }

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { serviceId: '', quantity: 1 }],
        })
    }

    const removeItem = (index: number) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index),
        })
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items]
        newItems[index] = { ...newItems[index], [field]: value }
        setFormData({ ...formData, items: newItems })
    }

    const getStatusColor = (status: string) => {
        return status === 'paid'
            ? 'bg-green-100 text-green-800'
            : 'bg-orange-100 text-orange-800'
    }

    return (
        <>
            <TopBar title="Invoices" />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">Manage your invoices and payments</p>
                    <Button data-tour="create-invoice-btn" onClick={() => setDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Invoice
                    </Button>
                </div>

                <Card data-tour="invoices-table">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Loading...</div>
                        ) : invoices.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No invoices yet. Create your first invoice to get started.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Issue Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                            <TableCell>{invoice.client.name}</TableCell>
                                            <TableCell className="font-semibold">
                                                ${parseFloat(invoice.total).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                                    {invoice.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(invoice.issuedAt), 'MMM dd, yyyy')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/invoices/${invoice.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(invoice.id)}
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

                {/* Create Invoice Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Invoice</DialogTitle>
                            <DialogDescription>
                                Generate an invoice for a client
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

                            <div className="space-y-3">
                                <Label>Services</Label>
                                {formData.items.map((item, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Select
                                            value={item.serviceId}
                                            onValueChange={(value) => updateItem(index, 'serviceId', value)}
                                            required
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select service" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {services.map((service) => (
                                                    <SelectItem key={service.id} value={service.id}>
                                                        {service.name} - ${parseFloat(service.price).toFixed(2)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                            className="w-20 px-3 py-2 border rounded-md"
                                            placeholder="Qty"
                                            required
                                        />
                                        {formData.items.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeItem(index)}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                    Add Service
                                </Button>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Create Invoice</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </main>
        </>
    )
}
