import type { ResultadoLiquidacion } from '@/types'
import { formatCurrency, formatDate, getLabelTipoSeparacion } from './calculadora'

export async function generarPDF(resultado: ResultadoLiquidacion): Promise<void> {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  // ── Colores ──
  const negro    = [21, 21, 21]   as [number, number, number]
  const dorado   = [212, 164, 19] as [number, number, number]
  const blanco   = [255, 255, 255] as [number, number, number]
  const grisOsc  = [44, 44, 44]   as [number, number, number]
  const grisMed  = [80, 80, 80]   as [number, number, number]
  const grisClar = [240, 240, 240] as [number, number, number]
  const verde    = [76, 175, 125]  as [number, number, number]
  const rojo     = [224, 82, 82]   as [number, number, number]

  // ══════════════════════════════════════
  // ENCABEZADO
  // ══════════════════════════════════════
  doc.setFillColor(...negro)
  doc.rect(0, 0, pageW, 28, 'F')

  // Línea dorada decorativa
  doc.setFillColor(...dorado)
  doc.rect(0, 28, pageW, 1.5, 'F')

  // Nombre app
  doc.setTextColor(...dorado)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('TuLiquidaciónMx', 14, 12)

  // Subtítulo
  doc.setTextColor(...blanco)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('by Nodeva Consultoría', 14, 19)

  // Fecha y folio
  doc.setTextColor(...blanco)
  doc.setFontSize(7.5)
  const fecha = formatDate(resultado.fechaCalculo)
  doc.text(`Fecha: ${fecha}`, pageW - 14, 12, { align: 'right' })
  doc.text('Este documento es orientativo', pageW - 14, 19, { align: 'right' })

  // ══════════════════════════════════════
  // TIPO DE SEPARACIÓN
  // ══════════════════════════════════════
  doc.setFillColor(...grisOsc)
  doc.rect(0, 29.5, pageW, 14, 'F')

  doc.setTextColor(...dorado)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(getLabelTipoSeparacion(resultado.tipoSeparacion).toUpperCase(), 14, 39)

  doc.setTextColor(...blanco)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `${resultado.antiguedadAnios} año(s) de antigüedad`,
    pageW - 14, 39, { align: 'right' }
  )

  let y = 56

  // ══════════════════════════════════════
  // DATOS DEL TRABAJADOR (si tiene nombre)
  // ══════════════════════════════════════
  if (resultado.datosLaborales.nombreTrabajador) {
    doc.setFillColor(...grisClar)
    doc.rect(14, y - 5, pageW - 28, 12, 'F')
    doc.setTextColor(...grisMed)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.text('TRABAJADOR', 18, y + 1)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...negro)
    doc.setFontSize(9)
    doc.text(resultado.datosLaborales.nombreTrabajador, 50, y + 1)
    y += 14
  }

  // ══════════════════════════════════════
  // DATOS DEL CÁLCULO
  // ══════════════════════════════════════
  doc.setTextColor(...dorado)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL CÁLCULO', 14, y)
  y += 4

  const periodicidadLabel: Record<string, string> = {
    semanal: 'Semanal', quincenal: 'Quincenal', mensual: 'Mensual'
  }

  autoTable(doc, {
    startY: y,
    head: [],
    body: [
      ['Sueldo bruto mensual',      formatCurrency(resultado.datosLaborales.sueldoBrutoMensual)],
      ['Periodicidad de pago',      periodicidadLabel[resultado.datosLaborales.periodicidad] ?? 'Mensual'],
      ['Salario diario',            formatCurrency(resultado.sdi.salarioDiario)],
      ['SDI (Sal. Diario Integrado)', formatCurrency(resultado.sdi.sdi)],
      ['Factor de integración',     resultado.sdi.factorIntegracion.toFixed(4)],
      ['Fecha de ingreso',          formatDate(resultado.datosLaborales.fechaIngreso)],
      ['Fecha de salida',           formatDate(resultado.datosLaborales.fechaSalida)],
      ['Antigüedad',                `${resultado.antiguedadAnios} año(s) — ${resultado.antiguedadDias} días`],
    ],
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70, textColor: grisMed },
      1: { cellWidth: 80, textColor: negro },
    },
    margin: { left: 14, right: 14 },
  })

  y = (doc as any).lastAutoTable.finalY + 10

  // ══════════════════════════════════════
  // DESGLOSE DE CONCEPTOS
  // ══════════════════════════════════════
  doc.setTextColor(...dorado)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('DESGLOSE DE CONCEPTOS', 14, y)
  y += 4

  autoTable(doc, {
    startY: y,
    head: [['Concepto', 'Descripción', 'Monto']],
    body: resultado.conceptos.map(c => [c.nombre, c.descripcion, formatCurrency(c.monto)]),
    theme: 'striped',
    headStyles: {
      fillColor: negro,
      textColor: dorado,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8, textColor: negro },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 95 },
      2: { cellWidth: 35, halign: 'right', textColor: verde },
    },
    margin: { left: 14, right: 14 },
  })

  y = (doc as any).lastAutoTable.finalY + 6

  // ══════════════════════════════════════
  // TOTALES
  // ══════════════════════════════════════

  // Subtotal
  doc.setFillColor(...grisClar)
  doc.rect(14, y, pageW - 28, 8, 'F')
  doc.setTextColor(...grisMed)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal bruto', 18, y + 5.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...negro)
  doc.text(formatCurrency(resultado.subtotal), pageW - 18, y + 5.5, { align: 'right' })
  y += 10

  // ISR
  doc.setFillColor(...grisClar)
  doc.rect(14, y, pageW - 28, 8, 'F')
  doc.setTextColor(...grisMed)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Descuento ISR estimado', 18, y + 5.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...rojo)
  doc.text(`- ${formatCurrency(resultado.descuentoISR)}`, pageW - 18, y + 5.5, { align: 'right' })
  y += 12

  // Total neto destacado
  doc.setFillColor(...negro)
  doc.rect(14, y, pageW - 28, 14, 'F')
  doc.setFillColor(...dorado)
  doc.rect(14, y, 3, 14, 'F')

  doc.setTextColor(...blanco)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL NETO A RECIBIR', 22, y + 9)

  doc.setTextColor(...dorado)
  doc.setFontSize(13)
  doc.text(formatCurrency(resultado.totalNeto), pageW - 18, y + 9.5, { align: 'right' })
  y += 20

  // ══════════════════════════════════════
  // AVISO LEGAL
  // ══════════════════════════════════════
  doc.setFillColor(255, 251, 235)
  doc.rect(14, y, pageW - 28, 20, 'F')
  doc.setDrawColor(212, 164, 19)
  doc.setLineWidth(0.5)
  doc.rect(14, y, pageW - 28, 20)

  doc.setTextColor(120, 90, 10)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('⚠ AVISO IMPORTANTE', 18, y + 5)
  doc.setFont('helvetica', 'normal')
  const avisoLineas = [
    'Este documento es una estimación orientativa basada en la Ley Federal del Trabajo.',
    'El descuento de ISR es aproximado y puede variar según la situación fiscal del trabajador.',
    'Se recomienda consultar a un abogado laboral para verificar montos antes de firmar cualquier acuerdo.',
  ]
  avisoLineas.forEach((linea, i) => {
    doc.text(linea, 18, y + 10 + (i * 4))
  })
  y += 26

  // ══════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════
  doc.setFillColor(...negro)
  doc.rect(0, pageH - 12, pageW, 12, 'F')
  doc.setTextColor(...dorado)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('TuLiquidaciónMx', 14, pageH - 5)
  doc.setTextColor(...blanco)
  doc.setFont('helvetica', 'normal')
  doc.text('by Nodeva Consultoría · Mérida, Yucatán', pageW / 2, pageH - 5, { align: 'center' })
  doc.text('tuliquidacionmx.com', pageW - 14, pageH - 5, { align: 'right' })

  // ── Descargar ──
  const nombreArchivo = resultado.datosLaborales.nombreTrabajador
    ? `liquidacion-${resultado.datosLaborales.nombreTrabajador.replace(/ /g, '-').toLowerCase()}.pdf`
    : `liquidacion-${getLabelTipoSeparacion(resultado.tipoSeparacion).replace(/ /g, '-').toLowerCase()}.pdf`

  doc.save(nombreArchivo)
}