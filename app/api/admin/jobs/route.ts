
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdminOrManager } from '@/lib/auth-helper'
import { z } from 'zod'
import { jobCreationSchema } from '@/lib/validations'
import { sendJobNotification } from '@/lib/notification-helper';
import { EventBus } from '@/lib/event-bus';

// Helper function to build where clause for filtering
function buildJobFilter(searchParams: URLSearchParams) {
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const teamId = searchParams.get('teamId')
    const customerId = searchParams.get('customerId')

    const where: any = {}

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { customer: { company: { contains: search, mode: 'insensitive' } } },
            { customer: { user: { name: { contains: search, mode: 'insensitive' } } } }
        ]
    }

    if (status && status !== 'all') where.status = status
    if (priority && priority !== 'all') where.priority = priority
    if (customerId && customerId !== 'all') where.customerId = customerId

    if (teamId && teamId !== 'all') {
        where.assignments = { some: { teamId } }
    }

    return where
}

async function fetchJobs(where: any) {
    try {
        console.log("Fetching jobs with where:", JSON.stringify(where));
        return await prisma.job.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100, // Limit to prevent timeout
            include: {
                customer: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                },
                assignments: {
                    include: {
                        team: true,
                        worker: {
                            select: { name: true }
                        }
                    }
                },
                _count: {
                    select: {
                        steps: true
                    }
                }
            }
        })
    } catch (e: any) {
        console.error("Prisma jobs fetch failed:", e);
        // Fallback: even more basic fetch
        try {
            return await prisma.job.findMany({
                where: where.id ? { id: where.id } : {}, // Try without complex filters if they fail
                orderBy: { createdAt: 'desc' },
                take: 50,
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    createdAt: true
                }
            });
        } catch (fallbackError) {
            console.error("Critical jobs fetch failure:", fallbackError);
            return [];
        }
    }
}

export async function GET(req: Request) {
    try {
        const session = await verifyAdminOrManager(req)
        if (!session) {
            console.warn(`Unauthorized access attempt to Jobs API`)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const where = buildJobFilter(searchParams)

        const jobs = await fetchJobs(where)
        console.log(`Fetched ${jobs.length} jobs. Formatting for mobile app...`);

        const formattedJobs = jobs.map((job: any) => {
            try {
                return {
                    id: job.id,
                    title: job.title,
                    status: job.status,
                    priority: job.priority,
                    location: job.location,
                    scheduledDate: job.scheduledDate,
                    createdAt: job.createdAt,
                    customer: job.customer ? {
                        id: job.customer.id,
                        company: job.customer.company,
                        user: job.customer.user ? {
                            name: job.customer.user.name
                        } : null
                    } : null,
                    assignments: job.assignments?.map((a: any) => ({
                        id: a.id,
                        team: a.team ? { name: a.team.name } : null,
                        worker: a.worker ? { name: a.worker.name } : null
                    })) || [],
                    _count: {
                        steps: job._count?.steps || 0
                    }
                };
            } catch (err) {
                console.error(`Error formatting job ${job.id}:`, err);
                return { id: job.id, title: "Formatting Error", status: "ERROR" };
            }
        });

        return NextResponse.json(formattedJobs)
    } catch (error: any) {
        console.error('Jobs fetch error detailed:', {
            message: error.message,
            stack: error.stack,
            url: req.url
        })
        return NextResponse.json({ 
            error: 'Internal Server Error', 
            message: error.message 
        }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await verifyAdminOrManager(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const data = jobCreationSchema.parse(body)

        // Verify existence of foreign keys
        const customerExists = await prisma.customer.findUnique({ where: { id: data.customerId } })
        if (!customerExists) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 400 })
        }

        if (data.teamId) {
            const teamExists = await prisma.team.findUnique({ where: { id: data.teamId } })
            if (!teamExists) {
                return NextResponse.json({ error: 'Team not found' }, { status: 400 })
            }
        }

        const newJob = await prisma.job.create({
            data: {
                title: data.title,
                description: data.description,
                customerId: data.customerId,
                creatorId: session.user.id,
                priority: data.priority,
                location: data.location,
                scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
                status: 'PENDING',
                steps: data.steps
                    ? {
                        create: data.steps.map((step, idx) => ({
                            title: step.title,
                            description: step.description,
                            order: idx + 1,
                            subSteps: step.subSteps
                                ? {
                                    create: step.subSteps.map((sub, sIdx) => ({
                                        title: sub.title,
                                        description: sub.description,
                                        order: sIdx + 1
                                    }))
                                }
                                : undefined
                        }))
                    }
                    : undefined
            },
            include: {
                customer: { include: { user: true } },
                steps: { include: { subSteps: true } }
            }
        })

        if (data.teamId || data.workerId) {
            await prisma.jobAssignment.create({
                data: {
                    jobId: newJob.id,
                    teamId: data.teamId,
                    workerId: data.workerId,
                    assignedAt: new Date()
                }
            })

            // Notify assigned team or worker
            await sendJobNotification(
                newJob.id,
                'Yeni İş Atandı',
                `"${newJob.title}" başlıklı yeni bir iş size atandı.`,
                'INFO',
                `/worker/jobs/${newJob.id}`
            );
        }

        // Trigger side effects
        await EventBus.emit('job.created', newJob);

        return NextResponse.json(newJob, { status: 201 })
    } catch (error) {
        console.error('Job creation error:', error)
        if (error instanceof z.ZodError) {
            const errorMessage = error.issues.map(issue => issue.message).join(', ')
            return NextResponse.json({ error: errorMessage, details: error.issues }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
