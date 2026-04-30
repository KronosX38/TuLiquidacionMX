/**
 * Motor de cálculo de liquidaciones laborales
 * Base legal: Ley Federal del Trabajo (LFT) - México
 * Aplica para: Yucatán (SMG zona libre de la frontera norte no aplica)
 */

import type {
  DatosLaborales,
  SDICalculado,
  ConceptoLiquidacion,
  ResultadoLiquidacion,
  TipoSeparacion,
} from '@/types'

// ─── CONSTANTES LEGALES ───────────────────────────────────────────────────────

/** Salario Mínimo General vigente 2025 - zona no fronteriza */
export const UMA_DIARIA = 108.57  // UMA 2025 - actualizar cada año

/** Días de aguinaldo mínimo por LFT Art. 87 */
const DIAS_AGUINALDO = 15

/** Prima vacacional mínima por LFT Art. 80 */
const PRIMA_VACACIONAL = 0.25

/** Factor prima de antigüedad: 12 días por año (LFT Art. 162) */
const DIAS_PRIMA_ANTIGUEDAD = 12

/** Tope prima antigüedad: 2x SMG (LFT Art. 162) */
const TOPE_PRIMA_ANTIGUEDAD_FACTOR = 2

/** Meses de indemnización por despido injustificado (LFT Art. 50) */
const MESES_INDEMNIZACION = 3

/** Días por año trabajado en despido injustificado (LFT Art. 50) */
const DIAS_POR_ANIO = 20

// ─── TABLA DE VACACIONES (LFT Art. 76 - Reforma 2023) ─────────────────────────

export function getDiasVacaciones(aniosServicio: number): number {
  // Reforma LFT 2023: mínimo 12 días desde el primer año, +2 días c/año hasta 20
  if (aniosServicio < 1)  return 0
  if (aniosServicio === 1) return 12
  if (aniosServicio === 2) return 14
  if (aniosServicio === 3) return 16
  if (aniosServicio === 4) return 18
  if (aniosServicio <= 9)  return 20
  // A partir de 5 años: 2 días adicionales por cada 5 años
  const periodos = Math.floor((aniosServicio - 5) / 5)
  return 20 + (periodos * 2)
}

// ─── UTILIDADES DE FECHA ──────────────────────────────────────────────────────

export function calcularAntiguedad(fechaIngreso: string, fechaSalida: string) {
  const inicio = new Date(fechaIngreso)
  const fin    = new Date(fechaSalida)
  const diffMs = fin.getTime() - inicio.getTime()
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const anios = diffDias / 365.25
  return {
    anios:        Math.floor(anios),
    aniosExactos: anios,
    dias:         diffDias,
    meses:        diffDias / 30.4375,
  }
}

export type Periodicidad = 'semanal' | 'quincenal' | 'mensual'

export function convertirAMensual(monto: number, periodicidad: Periodicidad): number {
  switch (periodicidad) {
    case 'semanal':    return (monto / 7) * 30.4167
    case 'quincenal':  return monto * 2
    case 'mensual':    return monto
  }
}

// ─── CÁLCULO SDI ─────────────────────────────────────────────────────────────

export function calcularSDI(
  sueldoBrutoMensual: number,
  aniosServicio: number
): SDICalculado {
  const salarioDiario = sueldoBrutoMensual / 30

  const diasVac = getDiasVacaciones(aniosServicio)

  // Proporciones diarias de prestaciones
  const propAguinaldo       = DIAS_AGUINALDO / 365
  const propVacaciones      = diasVac / 365
  const propPrimaVacacional = (diasVac * PRIMA_VACACIONAL) / 365

  const factorIntegracion = 1 + propAguinaldo + propVacaciones + propPrimaVacacional

  return {
    salarioDiario,
    factorIntegracion: Math.round(factorIntegracion * 10000) / 10000,
    sdi: salarioDiario * factorIntegracion,
    desglose: {
      aguinaldo:       salarioDiario * propAguinaldo,
      vacaciones:      salarioDiario * propVacaciones,
      primaVacacional: salarioDiario * propPrimaVacacional,
    },
  }
}

// ─── PARTES PROPORCIONALES ───────────────────────────────────────────────────

function calcularPartesProporcioneales(
  salarioDiario: number,
  fechaIngreso: string,
  fechaSalida: string,
  aniosExactos: number,
  diasTomados: number = 0
): {
  vacaciones: number
  primaVacacional: number
  aguinaldo: number
} {
  const fin    = new Date(fechaSalida)
  const inicio = new Date(fechaIngreso)

  // Días trabajados en el año en curso
  const inicioAnio = new Date(fin.getFullYear(), 0, 1)
  const diasEnAnio = Math.floor((fin.getTime() - inicioAnio.getTime()) / (1000 * 60 * 60 * 24))

  // Vacaciones proporcionales
  const aniosCompletos = Math.floor(aniosExactos)
  const diasVacCorresponden = getDiasVacaciones(aniosCompletos + 1)
  const diasRestantes = Math.max(0, diasVacCorresponden - diasTomados)
  const vacProporcional = (diasEnAnio / 365) * diasRestantes * salarioDiario

  // Prima vacacional proporcional
  const primaProporcional = vacProporcional * PRIMA_VACACIONAL

  // Aguinaldo proporcional (días trabajados en el año / 365 * 15 días)
  const aguinaldoProporcional = (diasEnAnio / 365) * DIAS_AGUINALDO * salarioDiario

  return {
    vacaciones:      Math.max(0, vacProporcional),
    primaVacacional: Math.max(0, primaProporcional),
    aguinaldo:       Math.max(0, aguinaldoProporcional),
  }
}

// ─── CÁLCULO ISR SOBRE INDEMNIZACIÓN ─────────────────────────────────────────
// LFT: los primeros 90 SMG de indemnización están exentos de ISR

export function calcularISR(resultado: {
  vacaciones: number
  primaVacacional: number
  aguinaldo: number
  indemnizacion: number
  veinteDias: number
  primaAntiguedad: number
  diasSinPagar: number
  anios: number
  sueldoMensual: number
}): number {
  const SMG = 278.80

  // Exenciones por concepto usando UMA (no SMG)
  const exencionAguinaldo       = Math.min(resultado.aguinaldo, 30 * 278.80)
  const exencionPrimaVacacional = Math.min(resultado.primaVacacional, 15 * 278.80)

  // Exención indemnización: 90 x UMA x años de servicio
  const exencionIndemnizacion = 90 * UMA_DIARIA * Math.max(1, resultado.anios)

  // Bases gravables
  const gravableAguinaldo        = Math.max(0, resultado.aguinaldo - exencionAguinaldo)
  const gravablePrimaVacacional  = Math.max(0, resultado.primaVacacional - exencionPrimaVacacional)
  const gravableIndemnizacion    = Math.max(0,
    (resultado.indemnizacion + resultado.veinteDias + resultado.primaAntiguedad) - exencionIndemnizacion
  )
  const gravableVacaciones       = resultado.vacaciones
  const gravableDiasSinPagar     = resultado.diasSinPagar

  const baseGravableTotal =
    gravableAguinaldo +
    gravablePrimaVacacional +
    gravableIndemnizacion +
    gravableVacaciones +
    gravableDiasSinPagar

  if (baseGravableTotal <= 0) return 0

  // Tasa efectiva sobre último sueldo mensual ordinario
  const tasaEfectiva = calcularTasaEfectiva(resultado.sueldoMensual)

  return baseGravableTotal * tasaEfectiva
}

function calcularTasaEfectiva(sueldoMensual: number): number {
  const tablaISR = [
    { limite:      7735.00, cuotaFija:     0.00, tasa: 0.0192 },
    { limite:     65651.07, cuotaFija:   148.51, tasa: 0.0640 },
    { limite:    115375.90, cuotaFija:  3844.28, tasa: 0.1088 },
    { limite:    134119.41, cuotaFija:  9250.62, tasa: 0.1600 },
    { limite:    160577.65, cuotaFija: 12209.13, tasa: 0.1792 },
    { limite:    323862.00, cuotaFija: 16956.84, tasa: 0.2136 },
    { limite:    510451.00, cuotaFija: 51833.88, tasa: 0.2352 },
    { limite:    Infinity,  cuotaFija: 95768.74, tasa: 0.3000 },
  ]

  const renglon = tablaISR.find(r => sueldoMensual <= r.limite)!
  const limiteAnterior = tablaISR[tablaISR.indexOf(renglon) - 1]?.limite ?? 0
  const excedente = sueldoMensual - limiteAnterior
  const isrMensual = renglon.cuotaFija + (excedente * renglon.tasa)

  // Tasa efectiva = ISR mensual / sueldo mensual
  return isrMensual / sueldoMensual
}

// ─── MOTOR PRINCIPAL ─────────────────────────────────────────────────────────

export function calcularLiquidacion(datos: DatosLaborales): ResultadoLiquidacion {
  const { anios, aniosExactos, dias, meses } = calcularAntiguedad(
    datos.fechaIngreso,
    datos.fechaSalida
  )

  const sdiData = calcularSDI(datos.sueldoBrutoMensual, anios)
  const { salarioDiario, sdi } = sdiData

  const partes = calcularPartesProporcioneales(
    salarioDiario,
    datos.fechaIngreso,
    datos.fechaSalida,
    aniosExactos,
    datos.diasVacacionesTomados ?? 0
  )

  const conceptos: ConceptoLiquidacion[] = []

  // ── Días trabajados sin pagar ──
  if (datos.diasSinPagar && datos.diasSinPagar > 0) {
    conceptos.push({
      nombre: 'Días trabajados sin pagar',
      descripcion: `${datos.diasSinPagar} día(s) de salario pendiente de pago`,
      monto: salarioDiario * datos.diasSinPagar,
      tipo: 'suma',
      aplicaEn: ['injustificado', 'justificado', 'renuncia'],
    })
  }

  // ── Partes proporcionales (aplican a TODOS los tipos) ──
  conceptos.push({
    nombre: 'Vacaciones proporcionales',
    descripcion: `Días de vacaciones correspondientes al período trabajado`,
    monto: partes.vacaciones,
    tipo: 'suma',
    aplicaEn: ['injustificado', 'justificado', 'renuncia'],
  })

  conceptos.push({
    nombre: 'Prima vacacional',
    descripcion: `25% sobre vacaciones proporcionales (LFT Art. 80)`,
    monto: partes.primaVacacional,
    tipo: 'suma',
    aplicaEn: ['injustificado', 'justificado', 'renuncia'],
  })

  conceptos.push({
    nombre: 'Aguinaldo proporcional',
    descripcion: `Parte del aguinaldo del año en curso (LFT Art. 87)`,
    monto: partes.aguinaldo,
    tipo: 'suma',
    aplicaEn: ['injustificado', 'justificado', 'renuncia'],
  })

  // ── Indemnización (solo despido injustificado) ──
  if (datos.tipoSeparacion === 'injustificado') {
    const indemnizacion3Meses = salarioDiario * 30 * MESES_INDEMNIZACION

    conceptos.push({
      nombre: '3 meses de indemnización',
      descripcion: `${MESES_INDEMNIZACION} meses de salario diario (LFT Art. 50)`,
      monto: indemnizacion3Meses,
      tipo: 'suma',
      aplicaEn: ['injustificado'],
    })

    const veinteDiasPorAnio = sdi * DIAS_POR_ANIO * Math.max(1, anios)
    conceptos.push({
      nombre: '20 días por año trabajado',
      descripcion: `${DIAS_POR_ANIO} días × SDI × ${Math.max(1, anios)} año(s) (LFT Art. 50)`,
      monto: veinteDiasPorAnio,
      tipo: 'suma',
      aplicaEn: ['injustificado'],
    })
  }

  // ── Prima de antigüedad (injustificado y renuncia con 15+ años) ──
  const aplicaPrimaAntiguedad =
    datos.tipoSeparacion === 'injustificado' ||
    (datos.tipoSeparacion === 'renuncia' && anios >= 15)

  if (aplicaPrimaAntiguedad && anios >= 1) {
    const topeSDI = 278.80 * TOPE_PRIMA_ANTIGUEDAD_FACTOR
    const sdiFactor = Math.min(salarioDiario, topeSDI)
    const primaAntiguedad = sdiFactor * DIAS_PRIMA_ANTIGUEDAD * Math.max(1, anios)

    conceptos.push({
      nombre: 'Prima de antigüedad',
      descripcion: `12 días × año trabajado (tope: 2× SMG) (LFT Art. 162)`,
      monto: primaAntiguedad,
      tipo: 'suma',
      aplicaEn: ['injustificado', 'renuncia'],
    })
  }

  // ── Calcular subtotal ──
  const subtotal = conceptos
    .filter(c => c.aplicaEn.includes(datos.tipoSeparacion))
    .reduce((acc, c) => acc + c.monto, 0)

  // ── ISR (solo aplica sobre indemnización en despido injustificado) ──
 const getConcepto = (nombre: string) =>
    conceptos.find(c => c.nombre === nombre)?.monto ?? 0

  let descuentoISR = 0
descuentoISR = calcularISR({
    vacaciones:      getConcepto('Vacaciones proporcionales'),
    primaVacacional: getConcepto('Prima vacacional'),
    aguinaldo:       getConcepto('Aguinaldo proporcional'),
    indemnizacion:   getConcepto('3 meses de indemnización'),
    veinteDias:      getConcepto('20 días por año trabajado'),
    primaAntiguedad: getConcepto('Prima de antigüedad'),
    diasSinPagar:    getConcepto('Días trabajados sin pagar'),
    anios,
    sueldoMensual:   datos.sueldoBrutoMensual,
  })

  return {
    tipoSeparacion:  datos.tipoSeparacion,
    datosLaborales:  datos,
    sdi:             sdiData,
    antiguedadAnios: anios,
    antiguedadDias:  dias,
    conceptos:       conceptos.filter(c => c.aplicaEn.includes(datos.tipoSeparacion)),
    subtotal,
    descuentoISR,
    totalNeto:       subtotal - descuentoISR,
    salarioMinimo:   278.80,
    fechaCalculo:    new Date().toISOString(),
  }
}

// ─── FORMATEADORES ────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr))
}

export function getLabelTipoSeparacion(tipo: TipoSeparacion): string {
  const labels: Record<TipoSeparacion, string> = {
    injustificado: 'Despido injustificado',
    justificado:   'Despido justificado',
    renuncia:      'Renuncia / Finiquito',
  }
  return labels[tipo]
}
