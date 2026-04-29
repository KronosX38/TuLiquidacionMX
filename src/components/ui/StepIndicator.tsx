import { Check } from 'lucide-react'
import { clsx } from 'clsx'

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3
}

const steps = [
  { number: 1, label: 'Tipo de separación' },
  { number: 2, label: 'Tus datos' },
  { number: 3, label: 'Resultado' },
]

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number
        const isActive    = currentStep === step.number
        const isPending   = currentStep < step.number

        return (
          <div key={step.number} className="flex items-center">
            {/* Círculo del paso */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={clsx(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300',
                  {
                    'bg-brand-gold text-bg-primary shadow-gold animate-pulse-gold': isActive,
                    'bg-status-success text-bg-primary': isCompleted,
                    'bg-bg-card border border-bg-border text-brand-muted': isPending,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={clsx('text-xs font-medium hidden sm:block transition-colors', {
                  'text-brand-gold': isActive,
                  'text-status-success': isCompleted,
                  'text-brand-muted': isPending,
                })}
              >
                {step.label}
              </span>
            </div>

            {/* Línea conectora */}
            {index < steps.length - 1 && (
              <div
                className={clsx(
                  'h-px w-16 sm:w-24 mx-2 mb-4 transition-all duration-500',
                  currentStep > step.number ? 'bg-status-success' : 'bg-bg-border'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
