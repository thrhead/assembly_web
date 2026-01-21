import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { token } = await req.json()
        if (!token) {
            return new NextResponse('Token is required', { status: 400 })
        }

        await prisma.pushToken.upsert({
            where: { token },
            update: { userId: session.user.id },
            create: { token, userId: session.user.id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[PUSH_TOKEN_POST]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { token } = await req.json()
        if (!token) {
            return new NextResponse('Token is required', { status: 400 })
        }

        await prisma.pushToken.deleteMany({
            where: { 
                token,
                userId: session.user.id 
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[PUSH_TOKEN_DELETE]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
