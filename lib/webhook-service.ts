
import { prisma } from './db'
import crypto from 'crypto'
import { logIntegrationEvent } from './api-security'

export async function triggerWebhook(event: string, payload: any) {
    try {
        const webhooks = await prisma.webhook.findMany({
            where: { event, isActive: true }
        })

        const results = await Promise.allSettled(webhooks.map(async (webhook) => {
            const startTime = Date.now()
            const body = JSON.stringify({
                event,
                timestamp: new Date().toISOString(),
                data: payload
            })

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'X-Assembly-Tracker-Event': event
            }

            // Eğer secret varsa payloadi imzala
            if (webhook.secret) {
                const signature = crypto
                    .createHmac('sha256', webhook.secret)
                    .update(body)
                    .digest('hex')
                headers['X-Hub-Signature-256'] = `sha256=${signature}`
            }

            let statusCode = 0
            let responseData = null
            let errorMsg = null

            try {
                const response = await fetch(webhook.url, {
                    method: 'POST',
                    headers,
                    body,
                    signal: AbortSignal.timeout(10000) // 10s timeout
                })

                statusCode = response.status
                responseData = await response.text()

                if (!response.ok) {
                    throw new Error(`Webhook failed: ${response.statusText}`)
                }

                return { url: webhook.url, status: response.status }
            } catch (err: any) {
                errorMsg = err.message
                throw err
            } finally {
                const duration = Date.now() - startTime
                // Log the webhook attempt
                await logIntegrationEvent({
                    webhookId: webhook.id,
                    endpoint: webhook.url,
                    method: 'POST',
                    statusCode,
                    duration,
                    payload,
                    response: responseData,
                    error: errorMsg
                })
            }
        }))

        console.log(`Webhook triggers for ${event}:`, results)
        return results
    } catch (error) {
        console.error('Webhook trigger error:', error)
    }
}
