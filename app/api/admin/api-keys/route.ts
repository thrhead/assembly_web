
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/auth-helper'
import { z } from 'zod'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const apiKeySchema = z.object({
    name: z.string().min(1, 'İsim gereklidir')
})

export async function GET(req: Request) {
    try {
        const session = await verifyAdmin(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const apiKeys = await prisma.apiKey.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
                // key alanını asla dönmüyoruz (zaten hashlenmiş)
            }
        })

        return NextResponse.json(apiKeys)
    } catch (error) {
        console.error('API Key fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await verifyAdmin(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { name } = apiKeySchema.parse(body)

        // Generate a random API key
        const rawKey = `at_${crypto.randomBytes(32).toString('hex')}`

        // Hash the key for storage
        const hashedKey = await bcrypt.hash(rawKey, 10)

        const newApiKey = await prisma.apiKey.create({
            data: {
                name,
                key: hashedKey,
                userId: session.user.id
            },
            select: {
                id: true,
                name: true,
                isActive: true,
                createdAt: true
            }
        })

        // Sadece oluşturma anında ham anahtarı dönüyoruz.
        // Kullanıcıya bunu saklaması gerektiğini bildiriyoruz.
        return NextResponse.json({
            ...newApiKey,
            apiKey: rawKey
        }, { status: 201 })
    } catch (error) {
        console.error('API Key creation error:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
