import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

export interface JobReportData {
    id: string
    title: string
    status: string
    priority: string
    location: string
    scheduledDate: Date | null
    completedDate: Date | null
    signatureUrl?: string | null
    customer: {
        company: string
        address: string
        user: {
            name: string
            phone: string
            email: string
        }
    }
    steps: Array<{
        title: string
        isCompleted: boolean
        order: number
        subSteps?: Array<{
            title: string
            isCompleted: boolean
        }>
    }>
    costs: Array<{
        amount: number
        category: string
        description: string
        status: string
        date: Date
    }>
    team?: {
        name: string
        members: Array<{
            user: {
                name: string
                role: string
            }
        }>
    }
}

export function generateJobPDF(data: JobReportData) {
    const doc = new jsPDF()

    // Professional branding
    const companyName = "ASSEMBLY TRACKER"
    const companySlogan = "Saha Operasyon Yonetim Sistemi"

    let yPos = 20

    // Header Branding
    doc.setFillColor(248, 250, 252)
    doc.rect(0, 0, 210, 40, 'F')
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.setTextColor(22, 163, 74) // Green-600
    doc.text(companyName, 20, 25)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(companySlogan, 20, 32)

    doc.setFontSize(10)
    doc.text(`Rapor No: #${data.id.substring(0, 8).toUpperCase()}`, 190, 25, { align: 'right' })
    doc.text(`Tarih: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`, 190, 32, { align: 'right' })

    yPos = 55

    // Job Title Section
    doc.setFontSize(18)
    doc.setTextColor(0, 0, 0)
    doc.text(data.title, 20, yPos)
    
    yPos += 10
    doc.setDrawColor(22, 163, 74)
    doc.setLineWidth(0.5)
    doc.line(20, yPos, 190, yPos)

    yPos += 15

    // Summary Grid
    const summaryData = [
        ['Musteri', data.customer.company, 'Durum', data.status === 'COMPLETED' ? 'TAMAMLANDI' : 'DEVAM EDIYOR'],
        ['Planlanan', data.scheduledDate ? format(new Date(data.scheduledDate), 'dd.MM.yyyy') : '-', 'Oncelik', data.priority],
        ['Konum', data.location || '-', 'Tamamlanma', data.completedDate ? format(new Date(data.completedDate), 'dd.MM.yyyy') : '-']
    ]

    autoTable(doc, {
        startY: yPos,
        body: summaryData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
            0: { fontStyle: 'bold', textColor: [100, 100, 100], cellWidth: 30 },
            1: { cellWidth: 60 },
            2: { fontStyle: 'bold', textColor: [100, 100, 100], cellWidth: 30 },
            3: { fontStyle: 'bold' }
        }
    })

    yPos = (doc as any).lastAutoTable.finalY + 20

    // Steps Section
    doc.setFontSize(14)
    doc.setTextColor(22, 163, 74)
    doc.text('Yapilan Islemler', 20, yPos)
    yPos += 8

    const stepsData = data.steps.map(step => [
        step.order.toString(),
        step.title,
        step.isCompleted ? '[ EVET ]' : '[ HAYIR ]'
    ])

    autoTable(doc, {
        startY: yPos,
        head: [['#', 'Islem Adimi', 'Tamamlandi']],
        body: stepsData,
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74], fontSize: 10 },
        styles: { fontSize: 9 }
    })

    yPos = (doc as any).lastAutoTable.finalY + 20

    // Costs if any
    if (data.costs && data.costs.length > 0) {
        doc.setFontSize(14)
        doc.text('Maliyet Dokumu', 20, yPos)
        yPos += 8

        const costsData = data.costs.map(c => [
            format(new Date(c.date), 'dd.MM.yyyy'),
            c.description,
            c.category,
            `$${c.amount.toFixed(2)}`
        ])

        autoTable(doc, {
            startY: yPos,
            head: [['Tarih', 'Aciklama', 'Kategori', 'Tutar']],
            body: costsData,
            theme: 'grid',
            headStyles: { fillColor: [71, 85, 105] },
            styles: { fontSize: 9 }
        })

        yPos = (doc as any).lastAutoTable.finalY + 20
    }

    // Signature Area
    if (yPos > 230) { doc.addPage(); yPos = 30 }
    
    doc.setDrawColor(200, 200, 200)
    doc.line(20, yPos, 190, yPos)
    yPos += 10
    
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Musteri Onayi', 20, yPos)
    doc.text('Saha Sorumlusu', 130, yPos)
    
    yPos += 10
    if (data.signatureUrl) {
        try {
            doc.addImage(data.signatureUrl, 'PNG', 20, yPos, 50, 25)
        } catch (e) {
            doc.setFontSize(8)
            doc.text('[Dijital Imza Onayli]', 20, yPos + 10)
        }
    } else {
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text('____________________', 20, yPos + 10)
    }
    
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(data.customer.user.name, 20, yPos + 35)
    doc.text(data.team?.name || 'Yetkili Personel', 130, yPos + 35)

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Bu belge Assembly Tracker tarafından otomatik olarak oluşturulmuştur.`, 105, 285, { align: 'center' })
        doc.text(`Sayfa ${i} / ${pageCount}`, 190, 285, { align: 'right' })
    }

    doc.save(`Rapor_${data.id.substring(0,8)}.pdf`)
}

export function generateCostReportPDF(costs: Array<{
    date: Date,
    jobTitle: string,
    category: string | null,
    description: string,
    amount: number,
    status: string,
    createdBy: string
}>) {
    const doc = new jsPDF()

    // Set font
    doc.setFont('helvetica')

    let yPos = 20

    // Header
    doc.setFontSize(20)
    doc.setTextColor(22, 163, 74) // Green-600
    doc.text('Maliyet Raporu', 105, yPos, { align: 'center' })

    yPos += 15
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Oluşturulma Tarihi: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: tr })}`, 105, yPos, { align: 'center' })

    yPos += 15

    const costsData = costs.map(cost => [
        format(new Date(cost.date), 'dd/MM/yyyy', { locale: tr }),
        cost.jobTitle,
        cost.category || '-',
        cost.description,
        `₺${cost.amount.toFixed(2)}`,
        cost.status,
        cost.createdBy
    ])

    const totalCost = costs
        .filter(c => c.status === 'APPROVED')
        .reduce((sum, c) => sum + c.amount, 0)

    autoTable(doc, {
        startY: yPos,
        head: [['Tarih', 'İş', 'Kategori', 'Açıklama', 'Tutar', 'Durum', 'Oluşturan']],
        body: costsData,
        foot: [['', '', '', 'Toplam Onaylı:', `₺${totalCost.toFixed(2)}`, '', '']],
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [22, 163, 74] },
        footStyles: { fillColor: [248, 250, 252], fontStyle: 'bold' }
    })

    // Footer with page numbers
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
            `Sayfa ${i} / ${pageCount}`,
            105,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        )
    }

    const filename = `Maliyet_Raporu_${format(new Date(), 'yyyyMMdd')}.pdf`
    doc.save(filename)
}