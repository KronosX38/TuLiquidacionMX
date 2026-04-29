import Navbar from '@/components/ui/Navbar'
import CalculadoraWizard from '@/components/calculadora/CalculadoraWizard'
import { ShieldCheck, WifiOff, FileText } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-2xl px-4 pt-10 pb-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30
                        bg-brand-gold/5 px-3 py-1 text-xs text-brand-gold mb-4">
          ✦ Conforme a la Ley Federal del Trabajo · Reforma 2023
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-white mb-3 leading-tight">
          Calcula tu liquidación<br />
          <span className="text-brand-gold">en minutos, gratis</span>
        </h1>
        <p className="text-brand-muted text-sm sm:text-base max-w-md mx-auto mb-6">
          Despido injustificado, justificado o finiquito.
          SDI automático, prima de antigüedad e ISR incluidos.
        </p>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { icon: <WifiOff className="h-3.5 w-3.5" />, label: 'Funciona offline' },
            { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: 'Sin registro' },
            { icon: <FileText className="h-3.5 w-3.5" />, label: 'Descarga PDF' },
          ].map(b => (
            <span
              key={b.label}
              className="flex items-center gap-1.5 rounded-full border border-bg-border
                         bg-bg-card px-3 py-1 text-xs text-brand-muted"
            >
              <span className="text-brand-gold">{b.icon}</span>
              {b.label}
            </span>
          ))}
        </div>
      </section>

      {/* Calculadora */}
      <section className="pb-16">
        <CalculadoraWizard />
      </section>

      {/* Footer */}
      <footer className="border-t border-bg-border py-8 text-center">
        <p className="text-xs text-brand-muted">
          © {new Date().getFullYear()} TuLiquidaciónMx ·{' '}
          <a
            href="https://nodeva.mx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-gold hover:underline"
          >
            by Nodeva Consultoría Digital
          </a>
          {' · '}Mérida, Yucatán, México
        </p>
        <p className="text-xs text-brand-muted/60 mt-1">
          Esta herramienta es de carácter orientativo. Consulta a un abogado laboral para decisiones legales.
        </p>
      </footer>
    </main>
  )
}
