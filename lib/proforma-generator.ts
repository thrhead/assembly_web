
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

export interface ProformaData {
    id: string
    title: string
    customer: {
        company: string
        address: string
        taxId?: string
    }
    items: Array<{
        description: string
        quantity: number
        price: number
    }>
    completedDate: Date | null
}

export function generateProformaPDF(data: ProformaData) {
    const doc = new jsPDF()
    doc.setFont('helvetica')

    let yPos = 20

    // Logo & Header Area
    doc.setFontSize(22)
    doc.setTextColor(30, 41, 59) // Slate-800
    doc.text('PROFORMA FATURA', 105, yPos, { align: 'center' })

    yPos += 10
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`#${data.id.slice(-6).toUpperCase()}`, 105, yPos, { align: 'center' })

    yPos += 20

    // Company Info (Seller)
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.text('Hizmet Sağlayıcı:', 20, yPos)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    yPos += 6
    doc.text('Assembly Tracker Ltd. Şti.', 20, yPos)
    yPos += 5
    doc.text('Teknoloji Mah. Yazılım Sok. No:1', 20, yPos)
    yPos += 5
    doc.text('İstanbul / Türkiye', 20, yPos)

    // Customer Info (Buyer) - Right align
    let custY = yPos - 16
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Müşteri:', 190, custY, { align: 'right' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    custY += 6
    doc.text(data.customer.company, 190, custY, { align: 'right' })
    custY += 5
    doc.text(data.customer.address || '-', 190, custY, { align: 'right' })
    if (data.customer.taxId) {
        custY += 5
        doc.text(`Vergi No: ${data.customer.taxId}`, 190, custY, { align: 'right' })
    }

    yPos = Math.max(yPos, custY) + 20

    // Table
    const tableData = data.items.map((item, idx) => [
        (idx + 1).toString(),
        item.description,
        item.quantity.toString(),
        `₺${item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
        `₺${(item.quantity * item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
    ])

    const total = data.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

    autoTable(doc, {
        startY: yPos,
        head: [['#', 'Açıklama', 'Adet', 'Birim Fiyat', 'Toplam']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59] },
        styles: { fontSize: 9, cellPadding: 4 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    // Totals
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`Ara Toplam: ₺${total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, 190, yPos, { align: 'right' })
    yPos += 7
    doc.text(`KDV (%20): ₺${(total * 0.2).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, 190, yPos, { align: 'right' })
    yPos += 8
    doc.setFontSize(14)
    doc.setTextColor(22, 163, 74) // Green
    doc.text(`GENEL TOPLAM: ₺${(total * 1.2).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, 190, yPos, { align: 'right' })

    yPos += 30

    // Footer / Notes
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.text('Banka Bilgileri:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    yPos += 6
    doc.text('Banka: Example Bank A.Ş.', 20, yPos)
    yPos += 5
    doc.text('IBAN: TR00 0000 0000 0000 0000 0000 00', 20, yPos)

    yPos += 20
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('Bu belge bir proforma faturadır, resmi mali belge yerine geçmez.', 105, yPos, { align: 'center' })

    const filename = `Proforma_${data.id.slice(-6)}_${format(new Date(), 'yyyyMMdd')}.pdf`
    doc.save(filename)
}
