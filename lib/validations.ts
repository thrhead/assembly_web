import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'
import { loginSchema, registerSchema, createUserAdminSchema } from './validations-edge'

export { loginSchema, registerSchema, createUserAdminSchema }

// Job Schemas
export const jobSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır').max(100, 'Başlık en fazla 100 karakter olabilir'),
  description: z.string().optional().transform(val => val ? DOMPurify.sanitize(val) : val),
  customerId: z.string().cuid('Geçerli bir müşteri seçiniz'),
  teamId: z.string().cuid().optional(),
  estimatedHours: z.number().int().positive().optional(),
  startDate: z.date().optional(),
})

export const jobStepSchema = z.object({
  title: z.string().min(2, 'Başlık en az 2 karakter olmalıdır'),
  description: z.string().optional(),
  stepOrder: z.number().int().positive(),
})

export const updateJobStepSchema = z.object({
  isCompleted: z.boolean(),
  notes: z.string().optional().transform(val => val ? DOMPurify.sanitize(val) : val),
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

// Job Creation Schema
export const jobCreationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  customerId: z.string().min(1, 'Customer is required'),
  teamId: z.string().optional(),
  workerId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  location: z.string().optional(),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  steps: z.array(z.object({
    title: z.string().min(1, 'Step title is required'),
    description: z.string().optional(),
    order: z.number().optional(),
    subSteps: z.array(z.object({
      title: z.string().min(1, 'Sub-step title is required'),
      description: z.string().optional(),
      order: z.number().optional()
    })).optional()
  })).optional().nullable()
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type JobInput = z.infer<typeof jobSchema>
export type JobStepInput = z.infer<typeof jobStepSchema>
export type UpdateJobStepInput = z.infer<typeof updateJobStepSchema>
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type CreateTeamInput = z.infer<typeof createTeamSchema>

export type CreateUserAdminInput = z.infer<typeof createUserAdminSchema>
