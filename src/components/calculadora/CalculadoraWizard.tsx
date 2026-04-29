'use client'

import { useState } from 'react'
import type { TipoSeparacion, DatosLaborales, ResultadoLiquidacion } from '@/types'
import { calcularLiquidacion } from '@/lib/calculadora'
import StepIndicator from '@/components/ui/StepIndicator'
import Step1Tipo from './Step1Tipo'
import Step2Datos from './Step2Datos'
import Step3Resultados from './Step3Resultados'

export default function CalculadoraWizard() {
  const [step, setStep]               = useState<1 | 2 | 3>(1)
  const [tipo, setTipo]               = useState<TipoSeparacion | null>(null)
  const [datosForm, setDatosForm]     = useState<Partial<DatosLaborales>>({})
  const [resultado, setResultado]     = useState<ResultadoLiquidacion | null>(null)

  function handleTipoSelected(t: TipoSeparacion) {
    setTipo(t)
  }

  function handleGoToStep2() {
    if (!tipo) return
    setStep(2)
  }

  function handleDatosSubmit(datos: DatosLaborales) {
    setDatosForm(datos)
    const res = calcularLiquidacion(datos)
    setResultado(res)
    setStep(3)
    // Scroll suave al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleNuevoCalculo() {
    setStep(1)
    setTipo(null)
    setDatosForm({})
    setResultado(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <StepIndicator currentStep={step} />

      {step === 1 && (
        <Step1Tipo
          value={tipo}
          onChange={handleTipoSelected}
          onNext={handleGoToStep2}
        />
      )}

      {step === 2 && tipo && (
        <Step2Datos
          tipoSeparacion={tipo}
          datosIniciales={datosForm}
          onBack={() => setStep(1)}
          onNext={handleDatosSubmit}
        />
      )}

      {step === 3 && resultado && (
        <Step3Resultados
          resultado={resultado}
          onNuevoCalculo={handleNuevoCalculo}
        />
      )}
    </div>
  )
}
