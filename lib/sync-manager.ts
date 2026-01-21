import { offlineDB, SyncQueueItem } from './offline-db'

const MAX_RETRIES = 3

export class SyncManager {
    private isSyncing = false

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                console.log('🌐 Online detected. Starting sync...')
                this.processQueue()
            })
        }
    }

    /**
     * Add request to offline queue
     */
    async addToQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt'>) {
        await offlineDB.syncQueue.add({
            ...item,
            createdAt: Date.now()
        })
        console.log('📥 Request queued:', item.url)
        
        // Try to process immediately if online (maybe false positive offline detection)
        if (navigator.onLine) {
            this.processQueue()
        }
    }

    /**
     * Process all queued items
     */
    async processQueue() {
        if (this.isSyncing || !navigator.onLine) return

        try {
            this.isSyncing = true
            const queueItems = await offlineDB.syncQueue.toArray()

            if (queueItems.length === 0) {
                this.isSyncing = false
                return
            }

            console.log(`🔄 Syncing ${queueItems.length} items...`)

            for (const item of queueItems) {
                try {
                    const response = await fetch(item.url, {
                        method: item.type,
                        headers: {
                            'Content-Type': 'application/json',
                            ...item.payload?.headers // Custom headers if saved
                        },
                        body: JSON.stringify(item.payload)
                    })

                    if (!response.ok) {
                        // If server error (5xx), maybe retry later
                        // If client error (4xx), usually drop it or alert user
                        if (response.status >= 500) {
                            throw new Error(`Server error: ${response.status}`)
                        } else if (response.status >= 400) {
                             console.warn(`❌ Client error (${response.status}) for ${item.url}. Dropping item.`)
                             await offlineDB.syncQueue.delete(item.id!)
                             continue
                        }
                    }

                    // Success
                    console.log(`✅ Synced: ${item.url}`)
                    await offlineDB.syncQueue.delete(item.id!)

                } catch (error) {
                    console.error(`❌ Sync failed for ${item.url}:`, error)
                    // Keep in queue for retry logic (implement retry count later)
                    // For now, we stop processing to preserve order if sequential dependency matters
                    // Or continue to next item? 
                    // Let's stop to be safe for dependencies (e.g. create job -> add photo)
                    break 
                }
            }

        } catch (error) {
            console.error('Sync process error:', error)
        } finally {
            this.isSyncing = false
            
            // Re-check queue in case new items added or failed items remain
            const remaining = await offlineDB.syncQueue.count()
            if (remaining > 0 && navigator.onLine) {
                // Retry in 5 seconds
                setTimeout(() => this.processQueue(), 5000)
            }
        }
    }
}

export const syncManager = new SyncManager()
