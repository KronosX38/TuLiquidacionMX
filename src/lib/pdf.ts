/**
 * Generador de PDF básico para resultado de liquidación
 * v1.0 - PDF funcional (sin diseño premium - eso es v1.5)
 */

import type { ResultadoLiquidacion } from '@/types'
import { formatCurrency, formatDate, getLabelTipoSeparacion } from './calculadora'

export async function generarPDF(resultado: ResultadoLiquidacion): Promise<void> {
  // Importación dinámica para no afectar bundle del cliente
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const gold   = [212, 164, 19]  as [number, number, number]
  const dark   = [33, 33, 33]    as [number, number, number]
  const gray   = [44, 44, 44]    as [number, number, number]
  const white  = [255, 255, 255] as [number, number, number]
  const muted  = [160, 160, 160] as [number, number, number]
  const green  = [76, 175, 125]  as [number, number, number]
  const red    = [224, 82, 82]   as [number, number, number]

  const pageW = doc.internal.pageSize.getWidth()

  // ── Encabezado ──
  doc.setFillColor(...dark)
  doc.rect(0, 0, pageW, 40, 'F')

  doc.setTextColor(...gold)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('TuLiquidaciónMx', 15, 18)

  doc.setTextColor(...muted)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Calculadora de liquidaciones laborales · by Nodeva Consultoría', 15, 26)
  doc.text(`Fecha de cálculo: ${formatDate(resultado.fechaCalculo)}`, 15, 33)

  // ── Tipo de separación ──
  doc.setFillColor(...gray)
  doc.rect(0, 40, pageW, 18, 'F')
  doc.setTextColor(...white)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(getLabelTipoSeparacion(resultado.tipoSeparacion).toUpperCase(), 15, 52)

  // ── Datos del trabajador ──
  let y = 72

  doc.setTextColor(...gold)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL CÁLCULO', 15, y)
  y += 8

  const datosTable = [
    ['Sueldo bruto mensual', formatCurrency(resultado.datosLaborales.sueldoBrutoMensual)],
    ['Salario diario', formatCurrency(resultado.sdi.salarioDiario)],
    ['SDI (Salario Diario Integrado)', formatCurrency(resultado.sdi.sdi)],
    ['Factor de integración', resultado.sdi.factorIntegracion.toFixed(4)],
    ['Fecha de ingreso', formatDate(resultado.datosLaborales.fechaIngreso)],
    ['Fecha de salida', formatDate(resultado.datosLaborales.fechaSalida)],
    ['Antigüedad', `${resultado.antiguedadAnios} año(s) — ${resultado.antiguedadDias} días`],
    ['Salario mínimo vigente', formatCurrency(resultado.salarioMinimo)],
  ]

  autoTable(doc, {
    startY: y,
    head: [],
    body: datosTable,
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [80, 80, 80],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80, textColor: [50, 50, 50] },
      1: { cellWidth: 80 },
    },
    margin: { left: 15, right: 15 },
  })

  y = (doc as any).lastAutoTable.finalY + 12

  // ── Conceptos ──
  doc.setTextColor(...gold)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('DESGLOSE DE CONCEPTOS', 15, y)
  y += 4

  const conceptosData = resultado.conceptos.map(c => [
    c.nombre,
    c.descripcion,
    formatCurrency(c.monto),
  ])

  autoTable(doc, {
    startY: y,
    head: [['Concepto', 'Descripción', 'Monto']],
    body: conceptosData,
    theme: 'striped',
    headStyles: {
      fillColor: gray,
      textColor: white,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50],
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 90 },
      2: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: 15, right: 15 },
  })

  y = (doc as any).lastAutoTable.finalY + 8

  // ── Totales ──
  const totalesData: [string, string][] = [
    ['Subtotal bruto', formatCurrency(resultado.subtotal)],
    ['Descuento ISR estimado', `- ${formatCurrency(resultado.descuentoISR)}`],
  ]

  autoTable(doc, {
    startY: y,
    head: [],
    body: totalesData,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold', textColor: [50, 50, 50] },
      1: { cellWidth: 50, halign: 'right', textColor: [50, 50, 50] },
    },
    margin: { left: 15, right: 15 },
  })

  y = (doc as any).lastAutoTable.finalY + 2

  // ── Total neto destacado ──
  doc.setFillColor(...dark)
  doc.rect(14, y, pageW - 28, 14, 'F')
  doc.setTextColor(...gold)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL NETO A RECIBIR', 18, y + 9)
  doc.text(formatCurrency(resultado.totalNeto), pageW - 18, y + 9, { align: 'right' })

  y += 22

  // ── Aviso legal ──
  doc.setFillColor(245, 245, 220)
  doc.rect(14, y, pageW - 28, 22, 'F')
  doc.setTextColor(100, 80, 20)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  const aviso = [
    'AVISO IMPORTANTE: Este cálculo es una estimación orientativa basada en la Ley Federal del Trabajo.',
    'El descuento de ISR es estimado y puede variar según la situación fiscal del trabajador.',
    'Se recomienda consultar a un abogado laboral para verificar montos exactos antes de cualquier acuerdo.',
    'TuLiquidaciónMx no se hace responsable por decisiones tomadas con base en este documento.',
  ]
  aviso.forEach((line, i) => {
    doc.text(line, 18, y + 6 + (i * 4))
  })

  y += 30

  // ── Footer ──
  doc.setTextColor(...muted)
  doc.setFontSize(7)
  doc.text(
    'TuLiquidaciónMx · by Nodeva Consultoría Digital · Mérida, Yucatán · www.tuliquidacionmx.com',
    pageW / 2, y, { align: 'center' }
  )

  // ── Descargar ──
  const fecha = new Date().toISOString().split('T')[0]
  doc.save(`liquidacion-${getLabelTipoSeparacion(resultado.tipoSeparacion).replace(/ /g, '-').toLowerCase()}-${fecha}.pdf`)
}
