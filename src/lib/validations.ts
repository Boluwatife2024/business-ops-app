import { z } from 'zod'

// Business validation
export const businessSchema = z.object({
    name: z.string().min(2, 'Business name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
})

// User/Auth validation
export const signupSchema = z.object({
    businessName: z.string().min(2, 'Business name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters').optional().or(z.literal('')),
})

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
})

export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})

// Client validation
export const clientSchema = z.object({
    name: z.string().min(2, 'Client name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
})

// Service validation
export const serviceSchema = z.object({
    name: z.string().min(2, 'Service name must be at least 2 characters'),
    description: z.string().optional(),
    price: z.number().min(0, 'Price must be a positive number'),
    duration: z.number().min(1, 'Duration must be at least 1 minute'),
})

// Booking validation
export const bookingSchema = z.object({
    clientId: z.string().min(1, 'Please select a client'),
    serviceId: z.string().min(1, 'Please select a service'),
    scheduledAt: z.date({
        message: 'Please select a date and time',
    }),
    status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
    notes: z.string().optional(),
})

// Invoice validation
export const invoiceSchema = z.object({
    clientId: z.string().min(1, 'Please select a client'),
    items: z.array(z.object({
        serviceId: z.string().min(1, 'Please select a service'),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
    })).min(1, 'Please add at least one service'),
})

// Contact form validation
export const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
})

export type BusinessInput = z.infer<typeof businessSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>
export type ClientInput = z.infer<typeof clientSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type InvoiceInput = z.infer<typeof invoiceSchema>
export type ContactInput = z.infer<typeof contactSchema>
