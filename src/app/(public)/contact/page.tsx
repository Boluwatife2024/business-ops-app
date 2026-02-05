'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, MessageSquare, Send } from 'lucide-react'

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' })
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')
        setError(null)

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                throw new Error('Failed to send message')
            }

            setStatus('success')
            setFormData({ name: '', email: '', message: '' })
        } catch (err) {
            setStatus('error')
            setError('Failed to send message. Please try again.')
        }
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="border-b bg-white/80 backdrop-blur-sm fixed w-full z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer">
                                BizOps
                            </h1>
                        </Link>
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/services" className="text-gray-600 hover:text-gray-900 transition">
                                Services
                            </Link>
                            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition">
                                Pricing
                            </Link>
                            <Link href="/contact" className="text-gray-900 font-medium">
                                Contact
                            </Link>
                            <Link href="/login">
                                <Button variant="ghost">Log in</Button>
                            </Link>
                            <Link href="/signup">
                                <Button>Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Get in Touch
                    </h1>
                    <p className="text-xl text-gray-600">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </section>

            {/* Contact Form */}
            <section className="pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <Card className="shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <MessageSquare className="h-6 w-6 text-blue-600" />
                                Send us a message
                            </CardTitle>
                            <CardDescription>
                                Fill out the form below and we'll get back to you within 24 hours
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {status === 'success' ? (
                                <div className="text-center py-8">
                                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                                    <p className="text-gray-600 mb-6">
                                        Thank you for contacting us. We'll get back to you soon.
                                    </p>
                                    <Button onClick={() => setStatus('idle')}>
                                        Send Another Message
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            disabled={status === 'loading'}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            disabled={status === 'loading'}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Tell us how we can help..."
                                            rows={6}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            required
                                            disabled={status === 'loading'}
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                            {error}
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full" size="lg" disabled={status === 'loading'}>
                                        {status === 'loading' ? (
                                            'Sending...'
                                        ) : (
                                            <>
                                                <Mail className="mr-2 h-5 w-5" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    )
}
