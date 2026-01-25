
'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-slate-900 border-b border-slate-800 p-4">
                <div className="container mx-auto">
                    <h1 className="text-xl font-bold text-white">Assembly Tracker API Documentation</h1>
                </div>
            </div>
            {(SwaggerUI as any) && <div className="swagger-container"><SwaggerUI url="/api/docs/swagger.json" /></div>}
        </div>
    )
}
