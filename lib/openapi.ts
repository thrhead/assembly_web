
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const registry = new OpenAPIRegistry()

// Add security schemas
registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
})

export function generateOpenApiDocs() {
    const generator = new OpenApiGeneratorV3(registry.definitions)

    return generator.generateDocument({
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'Assembly Tracker API',
            description: 'API documentation for Assembly Tracker enterprise management system',
        },
        servers: [{ url: '/api/v1' }],
    })
}
