'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useBalance } from '@/lib/hooks/useBalance'
import DepositModal from '@/components/ui/DepositModal'
import type { User } from '@/types/user'

interface HeaderProps {
  user: User | null
}

export default function Header({ user }: HeaderProps) {
  const { balance, flashState } = useBalance(user?.id)
  const [showDeposit, setShowDeposit] = useState(false)

  const displayBalance = user ? balance || user.balance : 0

  return (
    <>
      <header className="h-14 bg-[#06060A]/95 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4 lg:px-6 fixed top-0 left-0 right-0 z-50">
        {/* Logo */}
        <Link href="/game" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#b8870f] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 group-hover:shadow-[#D4AF37]/40 transition-all">
            <span className="text-sm">👑</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-black text-[#D4AF37] tracking-[0.12em] leading-none">
              NAIROBI KING
            </div>
            <div className="text-[8px] text-gray-600 tracking-[0.3em] leading-none mt-0.5">FLIP GAME</div>
          </div>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2">
              {/* Balance display */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 transition-all duration-300 ${
                  flashState === 'green'
                    ? 'border-green-400/60 bg-green-400/10 shadow-sm shadow-green-400/20'
                    : flashState === 'red'
                      ? 'border-red-400/60 bg-red-400/10'
                      : ''
                }`}
              >
                <div className="text-right">
                  <div className="text-[9px] text-gray-600 uppercase tracking-widest leading-none mb-0.5 hidden sm:block">
                    Balance
                  </div>
                  <div className={`font-black text-base leading-none tabular-nums transition-colors duration-300 ${
                    flashState === 'green' ? 'text-green-400' :
                    flashState === 'red' ? 'text-red-400' :
                    'text-[#D4AF37]'
                  }`}>
                    {displayBalance.toLocaleString()} KES
                  </div>
                </div>
              </div>

              {/* Deposit button */}
              <button
                onClick={() => setShowDeposit(true)}
                className="w-8 h-8 bg-[#D4AF37] hover:bg-[#F0CA50] rounded-lg flex items-center justify-center font-black text-lg text-black transition-all active:scale-95 shadow-md shadow-[#D4AF37]/20"
              >
                +
              </button>
            </div>
          )}

          {!user && (
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-lg bg-[#D4AF37] text-black text-sm font-bold hover:bg-[#F0CA50] transition-all"
            >
              Sign In
            </Link>
          )}

          {/* Nav icon */}
          <button className="w-8 h-8 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-white/10 transition-all">
            <span className="block w-4.5 h-[1.5px] bg-gray-400 rounded-full" />
            <span className="block w-3.5 h-[1.5px] bg-gray-500 rounded-full" />
            <span className="block w-4.5 h-[1.5px] bg-gray-400 rounded-full" />
          </button>
        </div>
      </header>

      {showDeposit && user && (
        <DepositModal user={user} onClose={() => setShowDeposit(false)} />
      )}
    </>
  )
}