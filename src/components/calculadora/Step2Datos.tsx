'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calculator } from 'lucide-react'
import type { DatosLaborales, TipoSeparacion } from '@/types'
import { calcularSDI, calcularAntiguedad, formatCurrency, getLabelTipoSeparacion, convertirAMensual } from '@/lib/calculadora'
import type { Periodicidad } from '@/types'
import Tooltip from '@/components/ui/Tooltip'

interface Step2DatosProps {
  tipoSeparacion: TipoSeparacion
  datosIniciales: Partial<DatosLaborales>
  onBack: () => void
  onNext: (datos: DatosLaborales) => void
}

interface Errores {
  sueldoBrutoMensual?: string
  fechaIngreso?: string
  fechaSalida?: string
}

export default function Step2Datos({ tipoSeparacion, datosIniciales, onBack, onNext }: Step2DatosProps) {
  const [sueldo, setSueldo] = useState(
    datosIniciales.sueldoBrutoMensual?.toString() ?? ''
  )
  const [periodicidad, setPeriodicidad] = useState<Periodicidad>(
    datosIniciales.periodicidad ?? 'mensual'
  )
  const [fechaIngreso, setFechaIngreso] = useState(datosIniciales.fechaIngreso ?? '')
  const [fechaSalida, setFechaSalida] = useState(
    datosIniciales.fechaSalida ?? new Date().toISOString().split('T')[0]
  )
  const [diasTomados, setDiasTomados] = useState<string>(
    datosIniciales.diasVacacionesTomados?.toString() ?? '0'
  )
  const [errores, setErrores] = useState<Errores>({})
  const [sdiPreview, setSdiPreview] = useState<number | null>(null)
  const [antiguedadPreview, setAntiguedadPreview] = useState<string | null>(null)

  // Preview del SDI en tiempo real
  useEffect(() => {
    const sueldoNum = parseFloat(sueldo)
    if (sueldoNum > 0 && fechaIngreso && fechaSalida) {
      try {
        const { anios } = calcularAntiguedad(fechaIngreso, fechaSalida)
        const sueldoMensual = convertirAMensual(sueldoNum, periodicidad)
        const sdiData = calcularSDI(sueldoMensual, anios)
        setSdiPreview(sdiData.sdi)
        setAntiguedadPreview(
          anios > 0
            ? `${anios} año${anios !== 1 ? 's' : ''} de antigüedad`
            : 'Menos de 1 año'
        )
      } catch {
        setSdiPreview(null)
      }
    } else {
      setSdiPreview(null)
      setAntiguedadPreview(null)
    }
  }, [sueldo, fechaIngreso, fechaSalida])

  function validar(): boolean {
    const errs: Errores = {}
    const sueldoNum = parseFloat(sueldo)

    if (!sueldo || isNaN(sueldoNum) || sueldoNum <= 0) {
      errs.sueldoBrutoMensual = 'Ingresa tu sueldo'
    } else {
      const mensual = convertirAMensual(sueldoNum, periodicidad)
      if (mensual < 278.80 * 30) {
        errs.sueldoBrutoMensual = 'El sueldo no puede ser menor al salario mínimo'
      }
    }

    if (!fechaIngreso) {
      errs.fechaIngreso = 'Selecciona la fecha de ingreso'
    }

    if (!fechaSalida) {
      errs.fechaSalida = 'Selecciona la fecha de salida'
    } else if (fechaIngreso && fechaSalida <= fechaIngreso) {
      errs.fechaSalida = 'La fecha de salida debe ser posterior a la de ingreso'
    }

    setErrores(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit() {
    if (!validar()) return
    const sueldoNum = parseFloat(sueldo)
    const sueldoMensual = convertirAMensual(sueldoNum, periodicidad)
    onNext({
      tipoSeparacion,
      periodicidad,
      sueldoBrutoMensual: sueldoMensual,
      fechaIngreso,
      fechaSalida,
      diasVacacionesTomados: parseInt(diasTomados) || 0,
    })
  }

  const hoy = new Date().toISOString().split('T')[0]

  return (
    <div className="animate-slide-up">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-brand-white mb-1">
          Ingresa tus datos laborales
        </h2>
        <p className="text-sm text-brand-muted">
          {getLabelTipoSeparacion(tipoSeparacion)}
        </p>
      </div>

      <div className="space-y-5">

        {/* Periodicidad */}
        <div>
          <label className="label">¿Cada cuánto te pagan?</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { valor: 'semanal', label: 'Semanal' },
              { valor: 'quincenal', label: 'Quincenal' },
              { valor: 'mensual', label: 'Mensual' },
            ] as { valor: Periodicidad; label: string }[]).map(op => (
              <button
                key={op.valor}
                type="button"
                onClick={() => setPeriodicidad(op.valor)}
                className={`rounded-xl border py-2.5 text-sm font-medium transition-all
                  ${periodicidad === op.valor
                    ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                    : 'border-bg-border bg-bg-card text-brand-muted hover:border-brand-gold/50'
                  }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sueldo */}
        <div>
          <label className="label flex items-center">
            {periodicidad === 'semanal' && 'Sueldo semanal'}
            {periodicidad === 'quincenal' && 'Sueldo quincenal'}
            {periodicidad === 'mensual' && 'Sueldo bruto mensual'}
            <Tooltip content="Ingresa tu sueldo BRUTO (antes de descontar ISR e IMSS). Lo encuentras en tu recibo de nómina como 'Total de Percepciones'." />
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted font-medium">
              $
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={
                periodicidad === 'semanal' ? 'Ej: 2,627.66' :
                  periodicidad === 'quincenal' ? 'Ej: 5,700.00' :
                    'Ej: 12,000.00'
              }
              value={sueldo}
              onChange={e => setSueldo(e.target.value)}
              className="input-field pl-8"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-brand-muted">
              MXN / bruto
            </span>
          </div>
          {errores.sueldoBrutoMensual && (
            <p className="mt-1 text-xs text-status-error">
              {errores.sueldoBrutoMensual}
            </p>
          )}
          {periodicidad !== 'mensual' && sueldo && !isNaN(parseFloat(sueldo)) && (
            <p className="mt-1 text-xs text-brand-gold/80">
              ≈ {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
                .format(convertirAMensual(parseFloat(sueldo), periodicidad))} mensual
            </p>
          )}
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label flex items-center">
              Fecha de ingreso
              <Tooltip content="El día que empezaste a trabajar en esa empresa. Generalmente está en tu contrato o en el IMSS." />
            </label>
            <input
              type="date"
              max={hoy}
              value={fechaIngreso}
              onChange={e => setFechaIngreso(e.target.value)}
              className="input-field"
              aria-describedby={errores.fechaIngreso ? 'err-ingreso' : undefined}
            />
            {errores.fechaIngreso && (
              <p id="err-ingreso" className="mt-1 text-xs text-status-error">
                {errores.fechaIngreso}
              </p>
            )}
          </div>

          <div>
            <label className="label flex items-center">
              Fecha de salida
              <Tooltip content="El último día que trabajaste. Si es hoy, deja la fecha de hoy." />
            </label>
            <input
              type="date"
              max={hoy}
              value={fechaSalida}
              onChange={e => setFechaSalida(e.target.value)}
              className="input-field"
              aria-describedby={errores.fechaSalida ? 'err-salida' : undefined}
            />
            {errores.fechaSalida && (
              <p id="err-salida" className="mt-1 text-xs text-status-error">
                {errores.fechaSalida}
              </p>
            )}
          </div>
        </div>

        {/* Vacaciones tomadas */}
        <div>
          <label className="label flex items-center">
            Días de vacaciones ya disfrutados este año
            <Tooltip content="Si ya tomaste vacaciones en el año en curso, indícalo aquí para descontarlos del cálculo. Si no tomaste ninguno, deja 0." />
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="30"
              step="1"
              placeholder="0"
              value={diasTomados}
              onChange={e => setDiasTomados(e.target.value)}
              className="input-field"
            />
          </div>
          <p className="mt-1 text-xs text-brand-muted">
            Deja en 0 si no has tomado vacaciones este año
          </p>
        </div>

        {/* Preview SDI */}
        {sdiPreview !== null && (
          <div className="rounded-xl bg-brand-gold/5 border border-brand-gold/20 p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-4 w-4 text-brand-gold" />
              <span className="text-sm font-medium text-brand-gold">Vista previa calculada</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-brand-muted mb-0.5">SDI calculado</p>
                <p className="text-lg font-semibold text-brand-white">
                  {formatCurrency(sdiPreview)}
                  <span className="text-xs text-brand-muted font-normal">/día</span>
                </p>
              </div>
              {antiguedadPreview && (
                <div>
                  <p className="text-xs text-brand-muted mb-0.5">Antigüedad</p>
                  <p className="text-lg font-semibold text-brand-white">{antiguedadPreview}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-brand-muted mt-2">
              El SDI incluye tu salario diario + proporcional de aguinaldo, vacaciones y prima vacacional
            </p>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-3 mt-8">
        <button type="button" onClick={onBack} className="btn-secondary flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Atrás
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          Calcular mi liquidación
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
