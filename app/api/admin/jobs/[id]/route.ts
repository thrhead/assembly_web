import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { z } from 'zod'
import { EventBus } from '@/lib/event-bus'

const updateJobSchema = z.object({
    startedAt: z.string().optional().nullable(),
    completedDate: z.string().optional().nullable(),
    scheduledDate: z.string().optional().nullable(),
    scheduledEndDate: z.string().optional().nullable(),
})

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await verifyAuth(req)
        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const params = await props.params
        const body = await req.json()
        const { startedAt, completedDate, scheduledDate, scheduledEndDate } = updateJobSchema.parse(body)

        const updatedJob = await prisma.job.update({
            where: { id: params.id },
            data: {
                startedAt: startedAt ? new Date(startedAt) : (startedAt === null ? null : undefined),
                completedDate: completedDate ? new Date(completedDate) : (completedDate === null ? null : undefined),
                scheduledDate: scheduledDate ? new Date(scheduledDate) : (scheduledDate === null ? null : undefined),
                scheduledEndDate: scheduledEndDate ? new Date(scheduledEndDate) : (scheduledEndDate === null ? null : undefined),
                status: completedDate ? 'COMPLETED' : undefined // Auto update status if completed date is set
            }
        })

        // Trigger side effects
        await EventBus.emit('job.updated', updatedJob);

        return NextResponse.json({ success: true, job: updatedJob })
    } catch (error) {
        console.error('Update job error:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}