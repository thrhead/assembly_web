import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import cloudinary from '@/lib/cloudinary'

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string; stepId: string }> }
) {
    const params = await props.params

    // Debug Cloudinary Config
    console.log('[Photo Upload Debug] Env Check:', {
        cloudNameExists: !!process.env.CLOUDINARY_CLOUD_NAME,
        apiKeyExists: !!process.env.CLOUDINARY_API_KEY,
        apiSecretExists: !!process.env.CLOUDINARY_API_SECRET
    });
    try {
        const session = await verifyAuth(req)
        if (!session || (session.user.role !== 'WORKER' && session.user.role !== 'TEAM_LEAD')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get('photo') as File
        const subStepId = formData.get('subStepId') as string | null

        console.log('[Photo Upload] Received request:', {
            stepId: params.stepId,
            subStepId,
            fileName: file?.name,
            fileSize: file?.size,
            fileType: file?.type
        })

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Convert file to buffer
        let buffer: Buffer
        try {
            if (typeof file.arrayBuffer === 'function') {
                const bytes = await file.arrayBuffer()
                buffer = Buffer.from(bytes)
            } else {
                console.log('[Photo Upload] arrayBuffer missing, trying Response workaround')
                const bytes = await new Response(file).arrayBuffer()
                buffer = Buffer.from(bytes)
            }
        } catch (err) {
            console.error('[Photo Upload] Error reading file buffer:', err)
            return NextResponse.json({ error: 'Failed to read file' }, { status: 500 })
        }

        // Create Data URI for upload
        const base64Data = buffer.toString('base64');
        const fileType = file.type || 'image/jpeg'; // Default to jpeg if type missing
        const dataURI = `data:${fileType};base64,${base64Data}`;

        console.log('[Photo Upload Debug] Uploading as Data URI, length:', base64Data.length);

        // Upload to Cloudinary using standard upload (not stream) which is often more stable for Data URIs
        const uploadResult: any = await cloudinary.uploader.upload(dataURI, {
            folder: `jobs/${params.id}`,
            resource_type: 'image',
            public_id: `${params.stepId}_${Date.now()}`
        });

        if (!uploadResult || !uploadResult.secure_url) {
            throw new Error('Cloudinary upload failed')
        }

        const photoUrl = uploadResult.secure_url

        // Create database record
        const photo = await prisma.stepPhoto.create({
            data: {
                stepId: params.stepId,
                subStepId: subStepId || null,
                url: photoUrl,
                uploadedById: session.user.id
            },
            include: {
                uploadedBy: {
                    select: { name: true }
                }
            }
        })

        // Emit Socket.IO event
        const socketPayload = {
            jobId: params.id,
            stepId: params.stepId,
            subStepId: subStepId || null,
            photoUrl: photoUrl,
            uploadedBy: session.user.name || session.user.email || 'Unknown',
            uploadedAt: new Date()
        }

        // Import socket functions dynamically to avoid circular deps if any
        const { emitToUser, broadcast } = await import('@/lib/socket')

        // Notify team lead/manager/admin
        // Find relevant users (e.g. job creator, team lead)
        const job = await prisma.job.findUnique({
            where: { id: params.id },
            include: {
                creator: true,
                assignments: { include: { team: true } }
            }
        })

        if (job) {
            if (job.creatorId) emitToUser(job.creatorId, 'photo:uploaded', socketPayload as unknown as Record<string, unknown>)
            // Broadcast to admins/managers
            broadcast('photo:uploaded', socketPayload as unknown as Record<string, unknown>)
        }

        return NextResponse.json(photo)
    } catch (error: any) {
        console.error('[Photo Upload CRITICAL ERROR]:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            params: await props.params
        })
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 })
    }
}
