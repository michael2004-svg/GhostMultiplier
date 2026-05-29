import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'nk-black': '#0A0A0A',
        'nk-crimson-dark': '#1A0000',
        'nk-gold': '#D4AF37',
        'nk-red': '#C0392B',
        'nk-card-black': '#1C1C1C',
        'nk-orange': '#F39C12',
        'nk-cashout': '#C0392B',
        'nk-green': '#27AE60',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-gold': 'pulseGold 1.5s ease-in-out infinite',
        'glow-red': 'glowRed 1s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'multiplier-tick': 'multiplierTick 0.1s ease-out',
        'balance-flash-green': 'balanceFlashGreen 0.6s ease-out',
        'balance-flash-red': 'balanceFlashRed 0.6s ease-out',
        'joker-slide': 'jokerSlide 0.5s ease-out',
        'card-float': 'cardFloat 3s ease-in-out infinite',
        'ember': 'ember 4s ease-in infinite',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 10px #D4AF37' },
          '50%': { boxShadow: '0 0 30px #D4AF37, 0 0 60px #D4AF37' },
        },
        glowRed: {
          from: { textShadow: '0 0 10px #E74C3C' },
          to: { textShadow: '0 0 30px #E74C3C, 0 0 60px #E74C3C' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        multiplierTick: {
          '0%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        balanceFlashGreen: {
          '0%': { color: '#27AE60', transform: 'scale(1.1)' },
          '100%': { color: '#D4AF37', transform: 'scale(1)' },
        },
        balanceFlashRed: {
          '0%': { color: '#E74C3C', transform: 'scale(0.95)' },
          '100%': { color: '#D4AF37', transform: 'scale(1)' },
        },
        jokerSlide: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        cardFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1deg)' },
        },
        ember: {
          '0%': { transform: 'translateY(0) translateX(0)', opacity: '1' },
          '100%': { transform: 'translateY(-200px) translateX(20px)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

export default config