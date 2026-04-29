'use client'

import { useState } from 'react'
import {
  Download, Share2, RotateCcw, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Info, Scale
} from 'lucide-react'
import type { ResultadoLiquidacion } from '@/types'
import {
  formatCurrency, formatDate, getLabelTipoSeparacion
} from '@/lib/calculadora'
import Tooltip from '@/components/ui/Tooltip'

interface Step3ResultadosProps {
  resultado: ResultadoLiquidacion
  onNuevoCalculo: () => void
}

export default function Step3Resultados({ resultado, onNuevoCalculo }: Step3ResultadosProps) {
  const [descargando, setDescargando] = useState(false)
  const [mostrarSDI, setMostrarSDI]   = useState(false)
  const [compartido, setCompartido]   = useState(false)

  async function handleDescargarPDF() {
    setDescargando(true)
    try {
      const { generarPDF } = await import('@/lib/pdf')
      await generarPDF(resultado)
    } catch (e) {
      console.error('Error generando PDF:', e)
    } finally {
      setDescargando(false)
    }
  }

  async function handleCompartir() {
    const texto = `Mi liquidación laboral calculada con TuLiquidaciónMx:\n` +
      `Tipo: ${getLabelTipoSeparacion(resultado.tipoSeparacion)}\n` +
      `Total neto: ${formatCurrency(resultado.totalNeto)}\n` +
      `Calcula la tuya en: tuliquidacionmx.com`

    if (navigator.share) {
      await navigator.share({ text: texto, title: 'Mi liquidación laboral' })
    } else {
      await navigator.clipboard.writeText(texto)
      setCompartido(true)
      setTimeout(() => setCompartido(false), 3000)
    }
  }

  const labelTipo = getLabelTipoSeparacion(resultado.tipoSeparacion)

  return (
    <div className="animate-slide-up space-y-4">

      {/* Header resultado */}
      <div className="card text-center">
        <div className="flex justify-center mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/10 border border-brand-gold/30">
            <Scale className="h-6 w-6 text-brand-gold" />
          </div>
        </div>
        <p className="text-sm text-brand-muted mb-1">{labelTipo}</p>
        <p className="text-xs text-brand-muted mb-3">
          {resultado.antiguedadAnios} año{resultado.antiguedadAnios !== 1 ? 's' : ''} de antigüedad ·
          Calculado el {formatDate(resultado.fechaCalculo)}
        </p>

        <div className="border-t border-bg-border pt-4">
          <p className="text-sm text-brand-muted mb-1">Total neto a recibir</p>
          <p className="text-4xl font-bold text-brand-gold">
            {formatCurrency(resultado.totalNeto)}
          </p>
          {resultado.descuentoISR > 0 && (
            <p className="text-xs text-brand-muted mt-1">
              (Subtotal {formatCurrency(resultado.subtotal)} − ISR estimado {formatCurrency(resultado.descuentoISR)})
            </p>
          )}
        </div>
      </div>

      {/* Desglose por concepto */}
      <div className="card">
        <h3 className="font-semibold text-brand-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand-gold" />
          Desglose de conceptos
        </h3>

        <div className="space-y-1">
          {resultado.conceptos.map((concepto, i) => (
            <div key={i} className="concepto-row">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium text-brand-white">{concepto.nombre}</p>
                <p className="text-xs text-brand-muted">{concepto.descripcion}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold text-status-success">
                  {formatCurrency(concepto.monto)}
                </span>
                <span className="badge-success">+</span>
              </div>
            </div>
          ))}

          {/* Subtotal */}
          <div className="flex justify-between items-center py-3 border-t border-bg-border mt-2 px-2">
            <span className="text-sm font-medium text-brand-muted">Subtotal bruto</span>
            <span className="text-sm font-semibold text-brand-white">
              {formatCurrency(resultado.subtotal)}
            </span>
          </div>

         {/* ISR */}
          {resultado.tipoSeparacion === 'injustificado' && (
            <div className="concepto-row">
              <div className="flex-1 min-w-0 pr-4 flex items-center gap-1">
                <p className="text-sm font-medium text-brand-white">Descuento ISR estimado</p>
                <Tooltip content="El ISR sobre indemnización está estimado. Los primeros 90 SMG por año están exentos. El monto exacto depende de tu situación fiscal." />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold text-status-error">
                  − {formatCurrency(resultado.descuentoISR)}
                </span>
                <span className="badge-error">−</span>
              </div>
            </div>
          )}

          {/* Total final */}
          <div className="flex justify-between items-center py-3 px-2 rounded-xl bg-brand-gold/5 border border-brand-gold/20 mt-2">
            <span className="font-semibold text-brand-white">Total neto</span>
            <span className="text-xl font-bold text-brand-gold">
              {formatCurrency(resultado.totalNeto)}
            </span>
          </div>
        </div>
      </div>

      {/* Detalle SDI */}
      <div className="card">
        <button
          type="button"
          onClick={() => setMostrarSDI(!mostrarSDI)}
          className="flex w-full items-center justify-between focus:outline-none"
        >
          <h3 className="font-semibold text-brand-white flex items-center gap-2">
            <Info className="h-4 w-4 text-brand-gold" />
            Cómo se calculó tu SDI
          </h3>
          {mostrarSDI
            ? <ChevronUp className="h-4 w-4 text-brand-muted" />
            : <ChevronDown className="h-4 w-4 text-brand-muted" />
          }
        </button>

        {mostrarSDI && (
          <div className="mt-4 space-y-2 animate-fade-in text-sm">
            <div className="concepto-row">
              <span className="text-brand-muted">Sueldo bruto mensual</span>
              <span className="text-brand-white font-medium">
                {formatCurrency(resultado.datosLaborales.sueldoBrutoMensual)}
              </span>
            </div>
            <div className="concepto-row">
              <span className="text-brand-muted">Salario diario</span>
              <span className="text-brand-white font-medium">
                {formatCurrency(resultado.sdi.salarioDiario)}
              </span>
            </div>
            <div className="concepto-row">
              <span className="text-brand-muted flex items-center gap-1">
                Factor de integración
                <Tooltip content="Incluye proporcionales diarios de aguinaldo, vacaciones y prima vacacional según tu antigüedad." />
              </span>
              <span className="text-brand-white font-medium">
                {resultado.sdi.factorIntegracion.toFixed(4)}
              </span>
            </div>
            <div className="concepto-row">
              <span className="text-brand-muted">Aguinaldo (proporcional diario)</span>
              <span className="text-brand-white font-medium">
                {formatCurrency(resultado.sdi.desglose.aguinaldo)}
              </span>
            </div>
            <div className="concepto-row">
              <span className="text-brand-muted">Vacaciones (proporcional diario)</span>
              <span className="text-brand-white font-medium">
                {formatCurrency(resultado.sdi.desglose.vacaciones)}
              </span>
            </div>
            <div className="concepto-row">
              <span className="text-brand-muted">Prima vacacional (proporcional diario)</span>
              <span className="text-brand-white font-medium">
                {formatCurrency(resultado.sdi.desglose.primaVacacional)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 px-2 rounded-xl bg-brand-gold/5 border border-brand-gold/20">
              <span className="font-semibold text-brand-white flex items-center gap-1">
                SDI calculado
                <Tooltip content="Salario Diario Integrado: es la base para calcular indemnización y prima de antigüedad." />
              </span>
              <span className="font-bold text-brand-gold">
                {formatCurrency(resultado.sdi.sdi)}/día
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Aviso legal */}
      <div className="rounded-xl border border-status-warning/20 bg-status-warning/5 p-4">
        <p className="text-xs text-status-warning/90 leading-relaxed">
          <strong>Aviso:</strong> Este cálculo es una estimación orientativa basada en la LFT.
          El ISR es aproximado y varía según tu situación fiscal.
          Te recomendamos verificar los montos con un abogado laboral antes de firmar cualquier liquidación.
        </p>
      </div>

      {/* Acciones */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleDescargarPDF}
          disabled={descargando}
          className="btn-primary flex items-center justify-center gap-2"
        >
          {descargando ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-bg-primary border-t-transparent" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {descargando ? 'Generando...' : 'Descargar PDF'}
        </button>

        <button
          type="button"
          onClick={handleCompartir}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          {compartido ? '¡Copiado!' : 'Compartir'}
        </button>
      </div>

      <button
        type="button"
        onClick={onNuevoCalculo}
        className="w-full flex items-center justify-center gap-2 text-sm text-brand-muted hover:text-brand-white transition-colors py-2"
      >
        <RotateCcw className="h-4 w-4" />
        Hacer otro cálculo
      </button>
    </div>
  )
}
