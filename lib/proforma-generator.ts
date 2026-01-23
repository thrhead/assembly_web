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

    let yPos = 0

    // Header Background
    doc.setFillColor(30, 41, 59) // Slate-800
    doc.rect(0, 0, 210, 40, 'F')

    doc.setFontSize(24)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.text('PROFORMA FATURA', 20, 25)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`No: #${data.id.slice(-8).toUpperCase()}`, 190, 25, { align: 'right' })

    yPos = 55

    // Seller & Buyer info columns
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('HIZMET SAGLAYICI', 20, yPos)
    doc.text('MUSTERI', 120, yPos)

    doc.setDrawColor(226, 232, 240)
    doc.line(20, yPos + 2, 90, yPos + 2)
    doc.line(120, yPos + 2, 190, yPos + 2)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    yPos += 10
    
    // Seller details
    doc.text('Assembly Tracker Ltd. Sti.', 20, yPos)
    doc.text('Teknoloji Mah. Yazilim Sok. No:1', 20, yPos + 5)
    doc.text('Istanbul / Turkiye', 20, yPos + 10)
    doc.text('Vergi No: 1234567890', 20, yPos + 15)

    // Buyer details
    doc.text(data.customer.company, 120, yPos)
    doc.text(data.customer.address || '-', 120, yPos + 5, { maxWidth: 70 })
    if (data.customer.taxId) {
        doc.text(`Vergi No: ${data.customer.taxId}`, 120, yPos + 15)
    }

    yPos += 30

    // Date and Description Table
    const tableData = data.items.map((item, idx) => [
        (idx + 1).toString(),
        item.description,
        item.quantity.toString(),
        `$${item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
        `$${(item.quantity * item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
    ])

    const total = data.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

    autoTable(doc, {
        startY: yPos,
        head: [['#', 'ACIKLAMA', 'ADET', 'BIRIM FIYAT', 'TOPLAM']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59], fontSize: 10, halign: 'center' },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            2: { halign: 'center', cellWidth: 20 },
            3: { halign: 'right', cellWidth: 35 },
            4: { halign: 'right', cellWidth: 35 }
        },
        styles: { fontSize: 9, cellPadding: 5 }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    // Totals Area
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Ara Toplam:', 140, yPos, { align: 'right' })
    doc.text(`$${total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, 190, yPos, { align: 'right' })
    
    yPos += 7
    doc.text('KDV (%20):', 140, yPos, { align: 'right' })
    doc.text(`$${(total * 0.2).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, 190, yPos, { align: 'right' })
    
    yPos += 10
    doc.setFillColor(248, 250, 252)
    doc.rect(120, yPos - 6, 75, 12, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 163, 74)
    doc.text('GENEL TOPLAM:', 140, yPos + 2, { align: 'right' })
    doc.text(`$${(total * 1.2).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`, 190, yPos + 2, { align: 'right' })

    yPos += 30

    // Bank & Notes
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('ODEME BILGILERI', 20, yPos)
    doc.line(20, yPos + 2, 60, yPos + 2)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    yPos += 10
    doc.text('Banka: GLOBAL TECH BANK A.S.', 20, yPos)
    doc.text('Hesap Adi: Assembly Tracker Ltd. Sti.', 20, yPos + 5)
    doc.text('IBAN: TR00 1111 2222 3333 4444 5555 66', 20, yPos + 10)

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    const footerText = 'Bu proforma fatura Assembly Tracker sistemi tarafindan otomatik olarak olusturulmustur.'
    doc.text(footerText, 105, 285, { align: 'center' })

    doc.save(`Proforma_${data.id.slice(-8).toUpperCase()}.pdf`)
}