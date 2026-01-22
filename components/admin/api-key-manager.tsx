
'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KeyIcon, PlusIcon, Trash2Icon, CopyIcon, CheckIcon, ShieldCheckIcon } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ApiKey {
    id: string
    name: string
    isActive: boolean
    createdAt: string
}

export function ApiKeyManager() {
    const [keys, setKeys] = useState<ApiKey[]>([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState('')
    const [creating, setCreating] = useState(false)
    const [newKeyData, setNewKeyData] = useState<{ name: string, apiKey: string } | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetchKeys()
    }, [])

    const fetchKeys = async () => {
        try {
            const res = await fetch('/api/admin/api-keys')
            const data = await res.json()
            setKeys(data)
        } catch (error) {
            toast.error('Anahtarlar yüklenirken hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const createKey = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim()) return

        setCreating(true)
        try {
            const res = await fetch('/api/admin/api-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            })
            const data = await res.json()
            setNewKeyData(data)
            setNewName('')
            fetchKeys()
            toast.success('API anahtarı oluşturuldu')
        } catch (error) {
            toast.error('Anahtar oluşturulamadı')
        } finally {
            setCreating(false)
        }
    }

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await fetch(`/api/admin/api-keys/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            })
            setKeys(keys.map(k => k.id === id ? { ...k, isActive: !currentStatus } : k))
            toast.success('Durum güncellendi')
        } catch (error) {
            toast.error('Güncelleme başarısız')
        }
    }

    const deleteKey = async (id: string) => {
        if (!confirm('Bu API anahtarını silmek istediğinize emin misiniz?')) return

        try {
            await fetch(`/api/admin/api-keys/${id}`, { method: 'DELETE' })
            setKeys(keys.filter(k => k.id !== id))
            toast.success('Anahtar silindi')
        } catch (error) {
            toast.error('Silme işlemi başarısız')
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.info('Panoya kopyalandı')
    }

    return (
        <div className="space-y-6">
            <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <KeyIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">API Erişimi</h3>
                        <p className="text-xs text-muted-foreground">Dış sistemler için entegrasyon anahtarları oluşturun.</p>
                    </div>
                </div>

                <form onSubmit={createKey} className="flex gap-4 items-end max-w-md">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="keyName">Anahtar İsmi (Örn: ERP Sistemi)</Label>
                        <Input
                            id="keyName"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Entegrasyon adı..."
                            className="bg-background"
                        />
                    </div>
                    <Button type="submit" disabled={creating || !newName.trim()}>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Oluştur
                    </Button>
                </form>

                {newKeyData && (
                    <Alert className="mt-6 border-primary/50 bg-primary/5">
                        <ShieldCheckIcon className="h-4 w-4 text-primary" />
                        <AlertTitle className="font-bold text-primary">Yeni API Anahtarınız hazır!</AlertTitle>
                        <AlertDescription className="space-y-4">
                            <p className="text-sm mt-2">
                                Bu anahtar güvenlik nedeniyle **sadece bir kez** gösterilecektir. Lütfen güvenli bir yere kaydedin.
                            </p>
                            <div className="flex items-center gap-2 p-3 bg-background rounded-lg border border-primary/20 break-all font-mono text-xs select-all">
                                <span>{newKeyData.apiKey}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 ml-auto shrink-0"
                                    onClick={() => copyToClipboard(newKeyData.apiKey)}
                                >
                                    {copied ? <CheckIcon className="h-4 w-4 text-emerald-500" /> : <CopyIcon className="h-4 w-4" />}
                                </Button>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setNewKeyData(null)}>
                                Anladım, Kaydettim
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="p-6 h-32 animate-pulse bg-muted/20" />
                    ))
                ) : keys.length > 0 ? (
                    keys.map((key) => (
                        <Card key={key.id} className="p-5 border-border hover:border-primary/30 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-sm truncate pr-2">{key.name}</h4>
                                    <p className="text-[10px] text-muted-foreground italic">
                                        Oluşturulma: {format(new Date(key.createdAt), 'd MMMM yyyy HH:mm', { locale: tr })}
                                    </p>
                                </div>
                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${key.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                                    {key.isActive ? 'Aktif' : 'Pasif'}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-muted">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`text-[10px] h-7 px-2 ${key.isActive ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                                    onClick={() => toggleStatus(key.id, key.isActive)}
                                >
                                    {key.isActive ? 'Durdur' : 'Aktif Et'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[10px] h-7 px-2 text-destructive hover:text-destructive/90 hover:bg-destructive/5"
                                    onClick={() => deleteKey(key.id)}
                                >
                                    <Trash2Icon className="w-3 h-3 mr-1" />
                                    Sil
                                </Button>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full p-12 text-center bg-muted/10 rounded-2xl border-2 border-dashed border-muted">
                        <p className="text-muted-foreground text-sm">Henüz bir API anahtarı oluşturulmamış.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
