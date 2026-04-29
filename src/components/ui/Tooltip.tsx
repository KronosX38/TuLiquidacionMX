'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface TooltipProps {
  content: string
  className?: string
}

export default function Tooltip({ content, className = '' }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        className="ml-1 text-brand-muted hover:text-brand-gold transition-colors focus:outline-none"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        aria-label="Más información"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {visible && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2
                     rounded-xl bg-bg-card border border-bg-border
                     px-3 py-2 text-xs text-brand-muted shadow-card
                     animate-fade-in pointer-events-none"
        >
          {content}
          {/* Flecha */}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4
                           border-transparent border-t-bg-border" />
        </span>
      )}
    </span>
  )
}
