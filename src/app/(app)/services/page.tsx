'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, Trash2, Clock, DollarSign } from 'lucide-react'

interface Service {
    id: string
    name: string
    description: string | null
    price: string
    duration: number
    createdAt: string
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingService, setEditingService] = useState<Service | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
    })

    useEffect(() => {
        fetchServices()
    }, [])

    const fetchServices = async () => {
        try {
            const response = await fetch('/api/services')
            if (response.ok) {
                const data = await response.json()
                setServices(data)
            }
        } catch (error) {
            console.error('Failed to fetch services:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = '/api/services'
            const method = editingService ? 'PUT' : 'POST'
            const body = editingService
                ? JSON.stringify({
                    id: editingService.id,
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    duration: parseInt(formData.duration),
                })
                : JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    duration: parseInt(formData.duration),
                })

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body,
            })

            if (response.ok) {
                setDialogOpen(false)
                setEditingService(null)
                setFormData({ name: '', description: '', price: '', duration: '' })
                fetchServices()
            }
        } catch (error) {
            console.error('Failed to save service:', error)
        }
    }

    const handleEdit = (service: Service) => {
        setEditingService(service)
        setFormData({
            name: service.name,
            description: service.description || '',
            price: service.price,
            duration: service.duration.toString(),
        })
        setDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return

        try {
            const response = await fetch(`/api/services?id=${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                fetchServices()
            }
        } catch (error) {
            console.error('Failed to delete service:', error)
        }
    }

    const openNewServiceDialog = () => {
        setEditingService(null)
        setFormData({ name: '', description: '', price: '', duration: '' })
        setDialogOpen(true)
    }

    return (
        <>
            <TopBar title="Services" />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">Manage your service offerings</p>
                    <Button data-tour="add-service-btn" onClick={openNewServiceDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Service
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading...</div>
                ) : services.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12 text-gray-500">
                            No services yet. Add your first service to get started.
                        </CardContent>
                    </Card>
                ) : (
                    <div data-tour="services-grid" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {services.map((service) => (
                            <Card key={service.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-start justify-between">
                                        <span className="text-xl">{service.name}</span>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(service)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(service.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </CardTitle>
                                    {service.description && (
                                        <CardDescription className="line-clamp-2">
                                            {service.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center text-lg font-semibold text-blue-600">
                                            <DollarSign className="h-5 w-5 mr-1" />
                                            {parseFloat(service.price).toFixed(2)}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Clock className="h-4 w-4 mr-2" />
                                            {service.duration} minutes
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Add/Edit Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingService ? 'Edit Service' : 'Add New Service'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingService
                                    ? 'Update service information'
                                    : 'Add a new service to your catalog'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Service Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price ($) *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (min) *</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        min="1"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingService ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </main>
        </>
    )
}
