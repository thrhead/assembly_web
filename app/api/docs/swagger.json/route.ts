
import { NextResponse } from 'next/server'
import { generateOpenApiDocs } from '@/lib/openapi'

export async function GET() {
    const spec = generateOpenApiDocs()
    return NextResponse.json(spec)
}
