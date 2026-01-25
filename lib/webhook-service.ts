
import { prisma } from './db'
import crypto from 'crypto'
import { logIntegrationEvent } from './api-security'

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1s

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function triggerWebhook(event: string, payload: any) {
    try {
        const webhooks = await prisma.webhook.findMany({
            where: { event, isActive: true }
        })

        const results = await Promise.allSettled(webhooks.map(async (webhook) => {
            const body = JSON.stringify({
                event,
                timestamp: new Date().toISOString(),
                data: payload
            })

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'X-Assembly-Tracker-Event': event
            }

            if (webhook.secret) {
                const signature = crypto
                    .createHmac('sha256', webhook.secret)
                    .update(body)
                    .digest('hex')
                headers['X-Hub-Signature-256'] = `sha256=${signature}`
            }

            let attempt = 0;
            let lastStatusCode = 0;
            let lastResponseData = null;
            let lastErrorMsg = null;
            let totalStartTime = Date.now();

            while (attempt <= MAX_RETRIES) {
                const startTime = Date.now();
                try {
                    const response = await fetch(webhook.url, {
                        method: 'POST',
                        headers,
                        body,
                        signal: AbortSignal.timeout(10000)
                    })

                    lastStatusCode = response.status;
                    lastResponseData = await response.text();

                    if (response.ok) {
                        await logIntegrationEvent({
                            webhookId: webhook.id,
                            endpoint: webhook.url,
                            method: 'POST',
                            statusCode: lastStatusCode,
                            duration: Date.now() - startTime,
                            payload,
                            response: lastResponseData || undefined,
                        });
                        return { url: webhook.url, status: response.status, attempts: attempt + 1 };
                    }

                    lastErrorMsg = `Status: ${response.status} ${response.statusText}`;
                } catch (err: any) {
                    lastErrorMsg = err.message;
                    lastStatusCode = lastStatusCode || 0;
                }

                attempt++;
                if (attempt <= MAX_RETRIES) {
                    const delay = INITIAL_DELAY * Math.pow(2, attempt - 1);
                    console.log(`Webhook retry ${attempt}/${MAX_RETRIES} for ${webhook.url} after ${delay}ms`);
                    await sleep(delay);
                }
            }

            // All retries failed
            await logIntegrationEvent({
                webhookId: webhook.id,
                endpoint: webhook.url,
                method: 'POST',
                statusCode: lastStatusCode,
                duration: Date.now() - totalStartTime,
                payload,
                response: lastResponseData || undefined,
                error: `Failed after ${MAX_RETRIES + 1} attempts. Last error: ${lastErrorMsg}`
            });

            throw new Error(`Webhook failed after ${MAX_RETRIES + 1} attempts`);
        }))

        console.log(`Webhook triggers for ${event}:`, results)
        return results
    } catch (error) {
        console.error('Webhook trigger error:', error)
    }
}
