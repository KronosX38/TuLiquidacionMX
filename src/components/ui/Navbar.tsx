'use client'

import Link from 'next/link'
import { Scale } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-bg-border bg-bg-primary/90 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold/10 border border-brand-gold/30 group-hover:bg-brand-gold/20 transition-colors">
              <Scale className="h-4 w-4 text-brand-gold" />
            </div>
            <div className="leading-tight">
              <span className="text-sm font-semibold text-brand-white">TuLiquidación</span>
              <span className="text-sm font-semibold text-brand-gold">Mx</span>
            </div>
          </Link>

          {/* By Nodeva */}
          <a
            href="https://nodevaconsultoria.mx"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-muted hover:text-brand-gold transition-colors"
          >
            by Nodeva Consultoría
          </a>
        </div>
      </div>
    </nav>
  )
}
