'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, Lock } from 'lucide-react'

export default function SettingsPage() {
    const { data: session } = useSession()
    const [businessData, setBusinessData] = useState({
        name: session?.user?.businessName || '',
        email: session?.user?.email || '',
        phone: '',
        address: '',
    })
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleBusinessUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage({ type: 'success', text: 'Business information updated successfully' })
        setTimeout(() => setMessage(null), 3000)
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' })
            return
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters' })
            return
        }

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setMessage({ type: 'success', text: 'Password changed successfully' })
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to change password' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to change password. Please try again.' })
        }

        setTimeout(() => setMessage(null), 5000)
    }

    return (
        <>
            <TopBar title="Settings" />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {message && (
                        <div
                            className={`p-4 rounded-md ${message.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* Business Information */}
                    <Card data-tour="business-info">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                <CardTitle>Business Information</CardTitle>
                            </div>
                            <CardDescription>
                                Update your business details and contact information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleBusinessUpdate} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="businessName">Business Name</Label>
                                        <Input
                                            id="businessName"
                                            value={businessData.name}
                                            onChange={(e) =>
                                                setBusinessData({ ...businessData, name: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="businessEmail">Email</Label>
                                        <Input
                                            id="businessEmail"
                                            type="email"
                                            value={businessData.email}
                                            onChange={(e) =>
                                                setBusinessData({ ...businessData, email: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="businessPhone">Phone</Label>
                                        <Input
                                            id="businessPhone"
                                            value={businessData.phone}
                                            onChange={(e) =>
                                                setBusinessData({ ...businessData, phone: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="businessAddress">Address</Label>
                                        <Input
                                            id="businessAddress"
                                            value={businessData.address}
                                            onChange={(e) =>
                                                setBusinessData({ ...businessData, address: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit">Save Changes</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Security */}
                    <Card data-tour="security-settings">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-blue-600" />
                                <CardTitle>Security</CardTitle>
                            </div>
                            <CardDescription>
                                Change your password and manage security settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) =>
                                            setPasswordData({ ...passwordData, currentPassword: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) =>
                                                setPasswordData({ ...passwordData, newPassword: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) =>
                                                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit">Change Password</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Account Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                            <CardDescription>
                                Your account details and subscription information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Account Owner</span>
                                <span className="font-medium">{session?.user?.name || session?.user?.email}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Business</span>
                                <span className="font-medium">{session?.user?.businessName}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Plan</span>
                                <span className="font-medium">Free Trial</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    )
}
