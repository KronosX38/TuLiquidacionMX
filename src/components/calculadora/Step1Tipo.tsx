'use client'

import { clsx } from 'clsx'
import type { TipoSeparacion } from '@/types'
import { UserX, UserCheck, LogOut, ChevronRight } from 'lucide-react'

interface Step1TipoProps {
  value: TipoSeparacion | null
  onChange: (tipo: TipoSeparacion) => void
  onNext: () => void
}

const opciones: {
  tipo: TipoSeparacion
  titulo: string
  descripcion: string
  detalle: string
  icon: React.ReactNode
  color: string
}[] = [
  {
    tipo: 'injustificado',
    titulo: 'Despido injustificado',
    descripcion: 'El patrón te despidió sin causa justificada',
    detalle: 'Tienes derecho a: 3 meses de salario + 20 días por año + partes proporcionales + prima de antigüedad',
    icon: <UserX className="h-6 w-6" />,
    color: 'border-status-error/40 hover:border-status-error',
  },
  {
    tipo: 'justificado',
    titulo: 'Despido justificado',
    descripcion: 'El patrón te despidió con causa justificada por la LFT',
    detalle: 'Tienes derecho a: partes proporcionales únicamente (vacaciones, prima vacacional, aguinaldo)',
    icon: <UserCheck className="h-6 w-6" />,
    color: 'border-status-warning/40 hover:border-status-warning',
  },
  {
    tipo: 'renuncia',
    titulo: 'Renuncia voluntaria / Finiquito',
    descripcion: 'Tú decidiste terminar la relación laboral',
    detalle: 'Tienes derecho a: partes proporcionales. Si tienes 15+ años, también prima de antigüedad',
    icon: <LogOut className="h-6 w-6" />,
    color: 'border-status-info/40 hover:border-status-info',
  },
]

export default function Step1Tipo({ value, onChange, onNext }: Step1TipoProps) {
  return (
    <div className="animate-slide-up">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-brand-white mb-1">
          ¿Cómo terminó tu relación laboral?
        </h2>
        <p className="text-sm text-brand-muted">
          Selecciona el tipo que mejor describe tu situación
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {opciones.map((op) => {
          const isSelected = value === op.tipo
          return (
            <button
              key={op.tipo}
              type="button"
              onClick={() => onChange(op.tipo)}
              className={clsx(
                'w-full text-left rounded-2xl border bg-bg-card p-4 transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-bg-primary',
                op.color,
                isSelected && 'ring-2 ring-brand-gold border-brand-gold bg-brand-gold/5'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Ícono */}
                <div
                  className={clsx(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors',
                    isSelected
                      ? 'bg-brand-gold text-bg-primary'
                      : 'bg-bg-input text-brand-muted'
                  )}
                >
                  {op.icon}
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <p className={clsx(
                    'font-semibold mb-0.5 transition-colors',
                    isSelected ? 'text-brand-gold' : 'text-brand-white'
                  )}>
                    {op.titulo}
                  </p>
                  <p className="text-sm text-brand-muted mb-2">
                    {op.descripcion}
                  </p>
                  {isSelected && (
                    <p className="text-xs text-brand-gold/80 bg-brand-gold/10 rounded-lg px-3 py-2 animate-fade-in">
                      ✦ {op.detalle}
                    </p>
                  )}
                </div>

                {/* Check */}
                <div
                  className={clsx(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all',
                    isSelected
                      ? 'bg-brand-gold border-brand-gold'
                      : 'border-bg-border'
                  )}
                >
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-bg-primary" />
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!value}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        Continuar
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
