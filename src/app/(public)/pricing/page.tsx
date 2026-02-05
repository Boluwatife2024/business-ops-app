import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

export default function PricingPage() {
    const plans = [
        {
            name: 'Starter',
            price: '$29',
            description: 'Perfect for solo entrepreneurs and small businesses',
            features: [
                'Up to 50 clients',
                'Unlimited bookings',
                'Invoice generation',
                'Basic analytics',
                'Email support',
            ],
            cta: 'Start Free Trial',
            popular: false,
        },
        {
            name: 'Professional',
            price: '$79',
            description: 'For growing businesses with more clients',
            features: [
                'Up to 500 clients',
                'Unlimited bookings',
                'Advanced invoicing',
                'Detailed analytics',
                'Priority support',
                'Custom branding',
                'API access',
            ],
            cta: 'Start Free Trial',
            popular: true,
        },
        {
            name: 'Enterprise',
            price: '$199',
            description: 'For large teams and established businesses',
            features: [
                'Unlimited clients',
                'Unlimited bookings',
                'Advanced features',
                'Custom analytics',
                '24/7 phone support',
                'Dedicated account manager',
                'Custom integrations',
                'SLA guarantee',
            ],
            cta: 'Contact Sales',
            popular: false,
        },
    ]

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
                            <Link href="/pricing" className="text-gray-900 font-medium">
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

            {/* Hero */}
            <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-gray-600">
                        Choose the plan that's right for your business. All plans include a 14-day free trial.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <Card
                                key={plan.name}
                                className={`relative ${plan.popular
                                        ? 'border-2 border-blue-600 shadow-2xl scale-105'
                                        : 'border-2 border-gray-200'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <CardHeader className="text-center pb-8">
                                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                                    <div className="mb-4">
                                        <span className="text-5xl font-bold">{plan.price}</span>
                                        <span className="text-gray-600">/month</span>
                                    </div>
                                    <CardDescription className="text-base">
                                        {plan.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <ul className="space-y-3">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start">
                                                <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link href="/signup" className="block">
                                        <Button
                                            className="w-full"
                                            variant={plan.popular ? 'default' : 'outline'}
                                            size="lg"
                                        >
                                            {plan.cta}
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Comparison */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">All Plans Include</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            'Client management',
                            'Booking scheduling',
                            'Invoice generation',
                            'Payment tracking',
                            'Service catalog',
                            'Business analytics',
                            'Mobile responsive',
                            'Data security',
                        ].map((feature) => (
                            <div key={feature} className="flex items-center">
                                <Check className="h-5 w-5 text-green-600 mr-3" />
                                <span className="text-gray-700">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ CTA */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Have Questions?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Our team is here to help you choose the right plan for your business
                    </p>
                    <Link href="/contact">
                        <Button size="lg" variant="outline">
                            Contact Us
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}
