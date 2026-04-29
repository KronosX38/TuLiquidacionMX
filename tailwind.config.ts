import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta TuLiquidaciónMx
        bg: {
          primary:   '#212121',
          card:      '#2C2C2C',
          input:     '#333333',
          border:    '#3A3A3A',
        },
        brand: {
          gold:      '#D4A413',
          'gold-hover': '#E8BA2A',
          white:     '#FFFFFF',
          muted:     '#A0A0A0',
        },
        status: {
          success:   '#4CAF7D',
          error:     '#E05252',
          warning:   '#F5A623',
          info:      '#4A9EE8',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(212, 164, 19, 0.15)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,164,19,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(212,164,19,0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
