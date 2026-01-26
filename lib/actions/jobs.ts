'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { sendJobNotification } from '@/lib/notification-helper'
import { EventBus } from '@/lib/event-bus'

const jobSchema = z.object({
  title: z.string().min(3, 'İş başlığı en az 3 karakter olmalıdır'),
  description: z.string().optional(),
  customerId: z.string().min(1, 'Müşteri seçilmelidir'),
  teamId: z.string().optional().nullable(),
  workerId: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  location: z.string().optional(),
  scheduledDate: z.string().optional(), // ISO date string
  scheduledEndDate: z.string().optional(), // ISO date string
  steps: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    subSteps: z.array(z.object({
      id: z.string().optional(),
      title: z.string()
    })).optional()
  })).optional().nullable()
})

const updateJobSchema = jobSchema.extend({
  id: z.string(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  acceptanceStatus: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']).optional(),
  startedAt: z.string().optional(),
  completedDate: z.string().optional(),
})

export type CreateJobState = {
  success?: boolean
  error?: string
  errors?: Record<string, string[]>
}

// ... existing code ...

export async function updateJobAction(data: z.infer<typeof updateJobSchema>) {
  const session = await auth()

  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    throw new Error('Yetkisiz işlem')
  }

  const validated = updateJobSchema.safeParse(data)

  if (!validated.success) {
    throw new Error('Geçersiz veri: ' + JSON.stringify(validated.error.flatten()))
  }

  const {
    id,
    title,
    description,
    customerId,
    teamId,
    workerId,
    priority,
    status,
    acceptanceStatus,
    location,
    scheduledDate,
    scheduledEndDate,
    startedAt,
    completedDate,
    steps
  } = validated.data

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update Job Basic Info
      await tx.job.update({
        where: { id },
        data: {
          title,
          description,
          customerId,
          priority,
          status: status || undefined,
          acceptanceStatus: acceptanceStatus || undefined,
          location,
          scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
          scheduledEndDate: scheduledEndDate ? new Date(scheduledEndDate) : null,
          startedAt: startedAt ? new Date(startedAt) : null,
          completedDate: completedDate ? new Date(completedDate) : null,
        }
      })

      // 2. Update Assignment
      // Delete existing assignments first for simplicity or update?
      // Let's check existing assignment.
      await tx.jobAssignment.deleteMany({ where: { jobId: id } })

      if ((teamId && teamId !== 'none') || (workerId && workerId !== 'none')) {
        await tx.jobAssignment.create({
          data: {
            jobId: id,
            teamId: teamId === 'none' ? undefined : teamId,
            workerId: workerId === 'none' ? undefined : workerId
          }
        })
      }

      // 3. Update Steps
      // We need to handle deletions, updates, and creations.
      // Fetch existing step IDs
      const existingSteps = await tx.jobStep.findMany({
        where: { jobId: id },
        select: { id: true }
      })
      const existingStepIds = existingSteps.map(s => s.id)

      const incomingStepIds = steps?.filter(s => s.id).map(s => s.id!) || []
      const stepsToDelete = existingStepIds.filter(id => !incomingStepIds.includes(id))

      // Delete removed steps
      if (stepsToDelete.length > 0) {
        await tx.jobStep.deleteMany({
          where: { id: { in: stepsToDelete } }
        })
      }

      if (steps && steps.length > 0) {
        for (let i = 0; i < steps.length; i++) {
          const stepData = steps[i]

          let stepId = stepData.id

          if (stepId) {
            // Update existing step
            await tx.jobStep.update({
              where: { id: stepId },
              data: {
                title: stepData.title,
                description: stepData.description,
                order: i + 1
              }
            })
          } else {
            // Create new step
            const newStep = await tx.jobStep.create({
              data: {
                jobId: id,
                title: stepData.title,
                description: stepData.description,
                order: i + 1
              }
            })
            stepId = newStep.id
          }

          // Handle SubSteps
          if (stepData.subSteps) {
            // For sub-steps, simpler to delete all and recreate or handle similarily?
            // Since sub-steps also have completion status, we should try to preserve IDs if possible.
            // But existing schema for substeps in validation allows ID.

            // Fetch existing substeps for THIS step
            const existingSubSteps = await tx.jobSubStep.findMany({
              where: { stepId: stepId },
              select: { id: true }
            })
            const existingSubStepIds = existingSubSteps.map(s => s.id)
            const incomingSubStepIds = stepData.subSteps.filter(s => s.id).map(s => s.id!)
            const subStepsToDelete = existingSubStepIds.filter(sid => !incomingSubStepIds.includes(sid))

            if (subStepsToDelete.length > 0) {
              await tx.jobSubStep.deleteMany({ where: { id: { in: subStepsToDelete } } })
            }

            for (let j = 0; j < stepData.subSteps.length; j++) {
              const subData = stepData.subSteps[j]
              if (subData.id) {
                await tx.jobSubStep.update({
                  where: { id: subData.id },
                  data: { title: subData.title, order: j + 1 }
                })
              } else {
                await tx.jobSubStep.create({
                  data: {
                    stepId: stepId!, // Asserted because we created it or it existed
                    title: subData.title,
                    order: j + 1
                  }
                })
              }
            }
          } else {
            // If no substeps provided, delete all? 
            // Or assumes empty array means delete all.
            await tx.jobSubStep.deleteMany({ where: { stepId: stepId } })
          }
        }
      } else {
        // If steps is empty array or null, delete all steps?
        // But we already handled deletions via ID diff. 
        // If steps is empty, incomingStepIds is empty, so all existingStepIds are deleted. Correct.
      }
    })

    revalidatePath('/admin/jobs')
    revalidatePath(`/admin/jobs/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Job update error:', error)
    throw new Error('İş güncellenirken bir hata oluştu')
  }
}

export async function deleteJobAction(id: string) {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Yetkisiz işlem: Sadece yöneticiler iş silebilir.')
  }

  try {
    await prisma.job.delete({
      where: { id }
    })

    // Yan etkileri tetikle
    await EventBus.emit('job.deleted', { id })

    revalidatePath('/admin/jobs')
    return { success: true }
  } catch (error) {
    console.error('Job deletion error:', error)
    throw new Error('İş silinirken bir hata oluştu')
  }
}

