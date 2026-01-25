import { z } from 'zod'

// Auth Schemas (Edge Safe)
export const loginSchema = z.object({
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
})

export const registerSchema = z.object({
    name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
    phone: z.string().optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'TEAM_LEAD', 'WORKER', 'CUSTOMER']),
})

export const createUserAdminSchema = z.object({
    name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    role: z.enum(['ADMIN', 'MANAGER', 'TEAM_LEAD', 'WORKER', 'CUSTOMER']),
    password: z.string().optional().transform(val => val || undefined),
})

// User Schemas
export const updateUserSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    isActive: z.boolean().optional(),
})

// Team Schemas
export const createTeamSchema = z.object({
    name: z.string().min(2, 'Takım adı en az 2 karakter olmalıdır'),
    leadId: z.string().cuid('Geçerli bir takım lideri seçiniz').optional().nullable(),
    description: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    memberIds: z.array(z.string()).optional()
})

// Customer Schemas
export const createCustomerSchema = z.object({
    companyName: z.string().min(2, 'Şirket adı en az 2 karakter olmalıdır'),
    contactPerson: z.string().min(2, 'Kişi adı en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    phone: z.string().optional(),
    address: z.string().optional(),
})

// Notification Schema
export const createNotificationSchema = z.object({
    userId: z.string().cuid(),
    jobId: z.string().cuid().optional(),
    title: z.string().min(1),
    message: z.string().min(1),
})

// Approval Schema
export const createApprovalSchema = z.object({
    jobId: z.string().cuid(),
    requesterId: z.string().cuid(),
    approverId: z.string().cuid(),
    notes: z.string().optional(),
})

export const updateApprovalSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    notes: z.string().optional(),
})

// Cost Tracking Schema
export const createCostTrackingSchema = z.object({
    jobId: z.string().cuid(),
    teamId: z.string().cuid(),
    hoursWorked: z.number().positive(),
    cost: z.number().positive(),
    notes: z.string().optional(),
})

// Shared Types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type CreateTeamInput = z.infer<typeof createTeamSchema>
export type CreateUserAdminInput = z.infer<typeof createUserAdminSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
