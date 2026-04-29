// Tipos principales de TuLiquidaciónMx

export type TipoSeparacion = 'injustificado' | 'justificado' | 'renuncia'
export type Periodicidad = 'semanal' | 'quincenal' | 'mensual'

export interface DatosLaborales {
  tipoSeparacion: TipoSeparacion
  sueldoBrutoMensual: number
  periodicidad: Periodicidad 
  fechaIngreso: string   // ISO date string YYYY-MM-DD
  fechaSalida: string    // ISO date string YYYY-MM-DD
  // Opcionales para cálculo SDI
  diasVacacionesTomados?: number
  diasSinPagar?: number
  diasAguinaldo?: number       // default 15
  diasVacaciones?: number      // calculado por ley según antigüedad
  primaVacacional?: number     // default 0.25 (25%)
}

export interface SDICalculado {
  salarioDiario: number
  factorIntegracion: number
  sdi: number
  desglose: {
    aguinaldo: number
    vacaciones: number
    primaVacacional: number
  }
}

export interface ConceptoLiquidacion {
  nombre: string
  descripcion: string
  monto: number
  tipo: 'suma' | 'descuento' | 'neutral'
  aplicaEn: TipoSeparacion[]
}

export interface ResultadoLiquidacion {
  tipoSeparacion: TipoSeparacion
  datosLaborales: DatosLaborales
  sdi: SDICalculado
  antiguedadAnios: number
  antiguedadDias: number
  conceptos: ConceptoLiquidacion[]
  subtotal: number
  descuentoISR: number
  totalNeto: number
  salarioMinimo: number  // SMG vigente Yucatán
  fechaCalculo: string
}

export interface FormStep {
  step: 1 | 2 | 3
  label: string
}
