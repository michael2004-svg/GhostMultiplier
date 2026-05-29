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
  const [gifts] = useState(2)

  return (
    <>
      <header className="h-16 bg-[#0D0000] border-b border-[#D4AF3722] flex items-center justify-between px-4 lg:px-6 fixed top-0 left-0 right-0 z-50">
        {/* Logo */}
        <Link href="/game" className="flex items-center gap-2">
          <span className="text-2xl">👑</span>
          <div className="hidden sm:block">
            <div className="text-sm font-black text-nk-gold tracking-wider leading-none">NAIROBI KING</div>
            <div className="text-[9px] text-gray-600 tracking-widest">FLIP GAME</div>
          </div>
        </Link>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Balance */}
          <div className="flex items-center gap-2">
            <div className={`text-right transition-all duration-300 ${
              flashState === 'green' ? 'animate-balance-flash-green' :
              flashState === 'red' ? 'animate-balance-flash-red' : ''
            }`}>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider hidden sm:block">Balance</div>
              <div className="text-nk-gold font-black text-lg leading-none">
                {balance.toLocaleString()} KES
              </div>
            </div>

            {/* Deposit button */}
            <button
              onClick={() => setShowDeposit(true)}
              className="w-8 h-8 bg-nk-green rounded-lg flex items-center justify-center font-bold text-lg hover:bg-[#2ecc71] transition-colors"
            >
              +
            </button>
          </div>

          {/* Gift icon */}
          <button className="relative w-9 h-9 flex items-center justify-center">
            <span className="text-xl">🎁</span>
            {gifts > 0 && (
              <span className="absolute -top-1 -right-1 bg-nk-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {gifts}
              </span>
            )}
          </button>

          {/* Menu */}
          <button className="w-9 h-9 flex flex-col items-center justify-center gap-1.5">
            <span className="block w-5 h-0.5 bg-white"></span>
            <span className="block w-5 h-0.5 bg-white"></span>
            <span className="block w-5 h-0.5 bg-white"></span>
          </button>
        </div>
      </header>

      {showDeposit && user && (
        <DepositModal user={user} onClose={() => setShowDeposit(false)} />
      )}
    </>
  )
}