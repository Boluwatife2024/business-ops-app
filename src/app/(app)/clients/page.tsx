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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Client {
    id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
    createdAt: string
}

export default function ClientsPage() {
    const router = useRouter()
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    })

    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        try {
            const response = await fetch('/api/clients')
            if (response.ok) {
                const data = await response.json()
                setClients(data)
            }
        } catch (error) {
            console.error('Failed to fetch clients:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = '/api/clients'
            const method = editingClient ? 'PUT' : 'POST'
            const body = editingClient
                ? JSON.stringify({ id: editingClient.id, ...formData })
                : JSON.stringify(formData)

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body,
            })

            if (response.ok) {
                setDialogOpen(false)
                setEditingClient(null)
                setFormData({ name: '', email: '', phone: '', address: '' })
                fetchClients()
            }
        } catch (error) {
            console.error('Failed to save client:', error)
        }
    }

    const handleEdit = (client: Client) => {
        setEditingClient(client)
        setFormData({
            name: client.name,
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || '',
        })
        setDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this client?')) return

        try {
            const response = await fetch(`/api/clients?id=${id}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                fetchClients()
            } else {
                const data = await response.json()
                alert(data.error || 'Failed to delete client')
            }
        } catch (error) {
            console.error('Failed to delete client:', error)
        }
    }

    const openNewClientDialog = () => {
        setEditingClient(null)
        setFormData({ name: '', email: '', phone: '', address: '' })
        setDialogOpen(true)
    }

    return (
        <>
            <TopBar title="Clients" />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">Manage your client information</p>
                    <Button data-tour="add-client-btn" onClick={openNewClientDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Client
                    </Button>
                </div>

                <Card data-tour="clients-table">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Loading...</div>
                        ) : clients.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No clients yet. Add your first client to get started.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clients.map((client) => (
                                        <TableRow key={client.id}>
                                            <TableCell className="font-medium">{client.name}</TableCell>
                                            <TableCell>{client.email || '—'}</TableCell>
                                            <TableCell>{client.phone || '—'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/clients/${client.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(client)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(client.id)}
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
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingClient ? 'Edit Client' : 'Add New Client'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingClient
                                    ? 'Update client information'
                                    : 'Add a new client to your database'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingClient ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </main>
        </>
    )
}
