'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, FileText, TrendingUp, ArrowRight } from 'lucide-react'

export default function HomePage() {
    const features = [
        {
            icon: Users,
            title: 'Client Management',
            description: 'Keep all your client information organized in one place. Track contact details, booking history, and invoices.',
        },
        {
            icon: Calendar,
            title: 'Smart Scheduling',
            description: 'Manage bookings effortlessly with our intuitive scheduling system. Never miss an appointment again.',
        },
        {
            icon: FileText,
            title: 'Invoice Generation',
            description: 'Create professional invoices from completed work in seconds. Track payments and outstanding balances.',
        },
        {
            icon: TrendingUp,
            title: 'Business Insights',
            description: 'Get a clear view of your business performance with real-time metrics and revenue tracking.',
        },
    ]

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="border-b bg-white/80 backdrop-blur-sm fixed w-full z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                BizOps
                            </h1>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/services" className="text-gray-600 hover:text-gray-900 transition">
                                Services
                            </Link>
                            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition">
                                Pricing
                            </Link>
                            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition">
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

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                                Manage Your Service Business{' '}
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Effortlessly
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                The all-in-one platform for service businesses to manage clients, schedule bookings,
                                generate invoices, and track payments. Focus on what you do best while we handle the rest.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/signup">
                                    <Button size="lg" className="w-full sm:w-auto">
                                        Start Free Trial
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/pricing">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                                        View Pricing
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    src="/hero-image.jpg"
                                    alt="Business team collaboration"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need to Run Your Business
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Powerful features designed specifically for service-based businesses
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature) => {
                            const Icon = feature.icon
                            return (
                                <Card key={feature.title} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                                    <CardHeader>
                                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-gray-600">
                                            {feature.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Business?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join hundreds of service businesses already using BizOps to streamline their operations
                    </p>
                    <Link href="/signup">
                        <Button size="lg" variant="secondary" className="text-lg px-8">
                            Get Started Free
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-white font-bold text-lg mb-4">BizOps</h3>
                            <p className="text-sm">
                                The complete business operations platform for service providers.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/services" className="hover:text-white transition">Features</Link></li>
                                <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
                        © 2026 BizOps. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    )
}
