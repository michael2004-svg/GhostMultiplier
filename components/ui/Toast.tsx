'use client'
import toast from 'react-hot-toast'

export function toastWin(amount: number) {
  toast.success(`You won ${amount.toLocaleString()} KES! 🎉`, {
    style: {
      background: '#0D1F0D',
      color: '#27AE60',
      border: '1px solid #27AE6044',
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 700,
    },
    duration: 4000,
  })
}

export function toastLoss() {
  toast('Better luck next round', {
    icon: '💔',
    style: {
      background: '#1A0000',
      color: '#999',
      border: '1px solid #C0392B22',
      fontFamily: 'Outfit, sans-serif',
    },
    duration: 3000,
  })
}

export function toastCashout(amount: number, multiplier: number) {
  toast.success(`Cashed out at ${multiplier.toFixed(2)}x — ${amount.toLocaleString()} KES`, {
    icon: '💰',
    style: {
      background: '#0D1F0D',
      color: '#27AE60',
      border: '1px solid #27AE6044',
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 700,
    },
    duration: 4000,
  })
}

export function toastJoker() {
  toast('JOKER! No one wins this round.', {
    icon: '🃏',
    style: {
      background: '#1A001A',
      color: '#E74C3C',
      border: '1px solid #E74C3C44',
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 700,
      fontSize: '16px',
    },
    duration: 5000,
  })
}

export function toastDeposit(amount: number) {
  toast.success(`Deposit successful — ${amount.toLocaleString()} KES added!`, {
    icon: '✅',
    style: {
      background: '#0D1F0D',
      color: '#27AE60',
      border: '1px solid #27AE6044',
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 700,
    },
    duration: 4000,
  })
}

export function toastLevelUp(level: string) {
  toast(`VIP ${level.toUpperCase()} UNLOCKED! 🎖`, {
    icon: '⬆️',
    style: {
      background: '#1A1400',
      color: '#D4AF37',
      border: '1px solid #D4AF3766',
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 900,
      fontSize: '18px',
    },
    duration: 6000,
  })
}

export function toastLowBalance() {
  toast('Balance low — Top up to keep playing', {
    icon: '⚠️',
    style: {
      background: '#1A1400',
      color: '#F39C12',
      border: '1px solid #F39C1244',
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 700,
    },
    duration: 5000,
  })
}