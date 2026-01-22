
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarIcon, ChevronLeft, ChevronRight, GripHorizontal } from 'lucide-react'
import { format, addDays, startOfToday, diffInDays, isSameDay } from 'date-fns'
import { tr } from 'date-fns/locale'
import { toast } from 'sonner'

interface Job {
    id: string
    title: string
    scheduledDate: string | null
    scheduledEndDate: string | null
    status: string
    ganttOrder: number
    customer: { company: string }
}

export function GanttChart() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [startDate, setStartDate] = useState(startOfToday())
    const timelineRef = useRef<HTMLDivElement>(null)

    const dayWidth = 100 // One day is 100px
    const visibleDays = 14
    const rowHeight = 60

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        try {
            const res = await fetch('/api/admin/jobs/gantt')
            const data = await res.json()
            setJobs(data)
        } catch (error) {
            toast.error('Veriler yüklenirken bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const getXPosition = (date: string | null) => {
        if (!date) return 0
        const d = new Date(date)
        const diff = (d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        return diff * dayWidth
    }

    const getDurationWidth = (start: string | null, end: string | null) => {
        if (!start || !end) return dayWidth // Default 1 day
        const s = new Date(start)
        const e = new Date(end)
        const diff = Math.max(1, (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
        return diff * dayWidth
    }

    const navigateTimeline = (days: number) => {
        setStartDate(prev => addDays(prev, days))
    }

    if (loading) return <div className="p-8 text-center animate-pulse">Yükleniyor...</div>

    return (
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">İş Zaman Çizelgesi</h3>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigateTimeline(-7)}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Geri
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setStartDate(startOfToday())}>
                        Bugün
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateTimeline(7)}>
                        İleri <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>

            <div className="relative border rounded-xl overflow-hidden bg-background">
                {/* Timeline Header */}
                <div className="flex border-b">
                    <div className="w-48 bg-muted/30 p-4 font-semibold border-r sticky left-0 z-20">İşler / Müşteri</div>
                    <div className="flex-1 overflow-x-auto no-scrollbar" ref={timelineRef}>
                        <div className="flex" style={{ width: visibleDays * dayWidth }}>
                            {Array.from({ length: visibleDays }).map((_, i) => {
                                const date = addDays(startDate, i)
                                const isToday = isSameDay(date, new Date())
                                return (
                                    <div
                                        key={i}
                                        className={`flex-none w-[100px] p-2 text-center text-xs border-r flex flex-col justify-center ${isToday ? 'bg-primary/5' : ''}`}
                                    >
                                        <span className="text-muted-foreground uppercase">{format(date, 'EEE', { locale: tr })}</span>
                                        <span className={`font-bold ${isToday ? 'text-primary' : ''}`}>{format(date, 'd MMM', { locale: tr })}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Rows */}
                <div className="max-h-[500px] overflow-y-auto">
                    {jobs.map((job, idx) => (
                        <div key={job.id} className="flex border-b last:border-0 group hover:bg-muted/10 transition-colors h-[60px]">
                            <div className="w-48 p-3 border-r sticky left-0 z-10 bg-background/95 backdrop-blur-sm flex flex-col justify-center gap-1">
                                <div className="flex items-center gap-2">
                                    <GripHorizontal className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing" />
                                    <span className="text-xs font-bold truncate">{job.title}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground truncate ml-5">{job.customer.company}</span>
                            </div>
                            <div className="flex-1 relative bg-muted/5">
                                {/* Vertical Day Grid */}
                                <div className="absolute inset-0 flex pointer-events-none">
                                    {Array.from({ length: visibleDays }).map((_, i) => (
                                        <div key={i} className="flex-none w-[100px] border-r border-muted/20 last:border-0 h-full" />
                                    ))}
                                </div>

                                {/* Job Bar */}
                                {job.scheduledDate && (
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center px-3 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer overflow-hidden"
                                        style={{
                                            left: getXPosition(job.scheduledDate),
                                            width: getDurationWidth(job.scheduledDate, job.scheduledEndDate)
                                        }}
                                        title={`${job.title} - ${job.customer.company}`}
                                    >
                                        <div className="w-2 h-2 rounded-full bg-primary mr-2 shadow-[0_0_8px_rgba(22,163,74,0.5)] animate-pulse" />
                                        <span className="text-[10px] font-bold text-primary truncate">%{Math.floor(Math.random() * 100)} Tamamlandı</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    )
}
