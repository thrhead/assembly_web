
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/auth-helper'
import { z } from 'zod'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await verifyAdmin(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()
        const { isActive } = z.object({ isActive: z.boolean() }).parse(body)

        const updated = await prisma.apiKey.update({
            where: { id, userId: session.user.id },
            data: { isActive },
            select: { id: true, isActive: true, name: true }
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('API Key update error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await verifyAdmin(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        await prisma.apiKey.delete({
            where: { id, userId: session.user.id }
        })

        return NextResponse.json({ message: 'API key deleted' })
    } catch (error) {
        console.error('API Key deletion error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
