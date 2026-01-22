import Dexie, { Table } from 'dexie'

export interface LocalMessage {
    id: string
    content: string
    senderId: string
    receiverId: string | null
    jobId: string | null
    conversationId: string
    isEncrypted: boolean
    sentAt: string
    status: 'queued' | 'sent' | 'delivered' | 'read'
    tempId?: string
}

export interface SyncQueueItem {
    id?: number
    type: 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    url: string
    payload: any
    createdAt: number
    retryCount?: number
}

class OfflineDatabase extends Dexie {
    messages!: Table<LocalMessage>
    syncQueue!: Table<SyncQueueItem>

    constructor() {
        super('AssemblyTrackerOfflineDB')
        
        this.version(1).stores({
            messages: 'id, jobId, conversationId, sentAt, status', // Indexes
            syncQueue: '++id, createdAt'
        })
    }
}

export const offlineDB = new OfflineDatabase()
