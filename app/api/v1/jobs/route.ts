
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getApiKeyFromRequest } from '@/lib/api-key-helper'

export async function GET(req: Request) {
    try {
        const apiKeyData = await getApiKeyFromRequest(req)
        if (!apiKeyData) {
            return NextResponse.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const customerId = searchParams.get('customerId')

        const where: any = {}
        if (status && status !== 'all') where.status = status
        if (customerId) where.customerId = customerId

        const jobs = await prisma.job.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                customer: {
                    select: { company: true }
                },
                _count: {
                    select: { steps: true }
                }
            }
        })

        return NextResponse.json({
            count: jobs.length,
            jobs: jobs.map(j => ({
                id: j.id,
                title: j.title,
                status: j.status,
                priority: j.priority,
                location: j.location,
                customer: j.customer.company,
                stepsCount: j._count.steps,
                scheduledDate: j.scheduledDate,
                createdAt: j.createdAt
            }))
        })
    } catch (error) {
        console.error('Public API Jobs fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
