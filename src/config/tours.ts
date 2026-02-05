'use client'

export interface TourStep {
    id: string
    target: string // CSS selector for the target element (e.g., '[data-tour="sidebar"]')
    title: string
    description: string
    position: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

export interface Tour {
    id: string
    name: string
    steps: TourStep[]
}

// Dashboard Tour - Main onboarding experience
export const dashboardTour: Tour = {
    id: 'dashboard-tour',
    name: 'Dashboard Tour',
    steps: [
        {
            id: 'welcome',
            target: 'body',
            title: 'Welcome to BizOps! 🚀',
            description: 'Your all-in-one solution for managing your service business. Let\'s take a quick tour.',
            position: 'center',
        },
        {
            id: 'sidebar',
            target: '[data-tour="sidebar"]',
            title: 'Navigation Hub',
            description: 'Access all your modules from here: Clients, Services, Bookings, and Invoices.',
            position: 'right',
        },
        {
            id: 'metrics',
            target: '[data-tour="dashboard-metrics"]',
            title: 'Quick Insights',
            description: 'Track your key business metrics at a glance - Clients, Revenue, and more.',
            position: 'bottom',
        },
        {
            id: 'bookings',
            target: '[data-tour="upcoming-bookings"]',
            title: 'Today\'s Agenda',
            description: 'Keep track of your upcoming appointments and schedule.',
            position: 'top',
        },
    ],
}

// Clients Page Tour
export const clientsTour: Tour = {
    id: 'clients-tour',
    name: 'Clients Tour',
    steps: [
        {
            id: 'add-client',
            target: '[data-tour="add-client-btn"]',
            title: 'Add Your First Client',
            description: 'Click here to start building your client database.',
            position: 'left',
        },
        {
            id: 'clients-table',
            target: '[data-tour="clients-table"]',
            title: 'Client Management',
            description: 'View details, contact info, and history for all your clients here.',
            position: 'top',
        },
    ],
}

// Invoices Page Tour
export const invoicesTour: Tour = {
    id: 'invoices-tour',
    name: 'Invoices Tour',
    steps: [
        {
            id: 'create-invoice',
            target: '[data-tour="create-invoice-btn"]',
            title: 'Get Paid Faster',
            description: 'Create professional invoices for your services in seconds.',
            position: 'left',
        },
        {
            id: 'invoices-table',
            target: '[data-tour="invoices-table"]',
            title: 'Payment Tracking',
            description: 'Monitor paid and unpaid invoices to keep your cash flow healthy.',
            position: 'top',
        },
    ],
}

// Bookings Page Tour
export const bookingsTour: Tour = {
    id: 'bookings-tour',
    name: 'Bookings Tour',
    steps: [
        {
            id: 'new-booking',
            target: '[data-tour="new-booking-btn"]',
            title: 'Schedule Appointments',
            description: 'Easily book new appointments for your clients.',
            position: 'left',
        },
        {
            id: 'bookings-table',
            target: '[data-tour="bookings-table"]',
            title: 'Calendar Management',
            description: 'View and manage all your scheduled services in one place.',
            position: 'top',
        },
    ],
}

// Services Page Tour
export const servicesTour: Tour = {
    id: 'services-tour',
    name: 'Services Tour',
    steps: [
        {
            id: 'add-service',
            target: '[data-tour="add-service-btn"]',
            title: 'Define Your Offerings',
            description: 'Create and manage the services you offer to clients.',
            position: 'left',
        },
        {
            id: 'services-grid',
            target: '[data-tour="services-grid"]',
            title: 'Service Catalog',
            description: 'View your service menu, prices, and durations at a glance.',
            position: 'top',
        },
    ],
}

// Settings Page Tour
export const settingsTour: Tour = {
    id: 'settings-tour',
    name: 'Settings Tour',
    steps: [
        {
            id: 'business-info',
            target: '[data-tour="business-info"]',
            title: 'Business Profile',
            description: 'Keep your business contact details up to date.',
            position: 'top',
        },
        {
            id: 'security',
            target: '[data-tour="security-settings"]',
            title: 'Account Security',
            description: 'Manage your password and account security settings here.',
            position: 'top',
        },
    ],
}

// Map of all tours by their ID
export const tours: Record<string, Tour> = {
    'dashboard-tour': dashboardTour,
    'clients-tour': clientsTour,
    'invoices-tour': invoicesTour,
    'bookings-tour': bookingsTour,
    'services-tour': servicesTour,
    'settings-tour': settingsTour,
}

// Map pages to their tour IDs
export const pageTourMap: Record<string, string> = {
    '/dashboard': 'dashboard-tour',
    '/clients': 'clients-tour',
    '/invoices': 'invoices-tour',
    '/bookings': 'bookings-tour',
    '/services': 'services-tour',
    '/settings': 'settings-tour',
}
