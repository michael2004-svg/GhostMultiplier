'use client'
import { useState } from 'react'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import DepositModal from '@/components/ui/DepositModal'
import type { User, Transaction } from '@/types/user'

interface Props { user: User; transactions: Transaction[] }

export default function WalletClient({ user, transactions }: Props) {
  const [showDeposit, setShowDeposit] = useState(false)

  return (
    <div className="min-h-screen nairobi-bg">
      <Header user={user} />
      <div className="pt-20 pb-20 px-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-nk-gold mb-6">Wallet</h1>

        {/* Balance card */}
        <div className="bg-gradient-to-br from-[#1A0000] to-[#0D0000] border border-[#D4AF3733] rounded-2xl p-6 mb-6">
          <div className="text-sm text-gray-500 mb-1">Available Balance</div>
          <div className="text-4xl font-black text-nk-gold mb-4">
            {user.balance.toLocaleString()} KES
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeposit(true)}
              className="flex-1 btn-place-bet py-3 rounded-xl font-bold text-white"
            >
              + DEPOSIT
            </button>
            <button className="flex-1 bg-[#1A0000] border border-[#333] py-3 rounded-xl font-bold text-gray-400 hover:border-nk-gold hover:text-nk-gold transition-colors">
              WITHDRAW
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Total Wagered', value: user.totalWagered },
            { label: 'Total Won', value: user.totalWon },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0D0000] border border-[#D4AF3722] rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
              <div className="text-xl font-black text-white">{stat.value.toLocaleString()} KES</div>
            </div>
          ))}
        </div>

        {/* Transaction history */}
        <div>
          <h2 className="text-lg font-bold mb-3">Transaction History</h2>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-[#0D0000] border border-[#D4AF3711] rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm">{tx.type}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-black ${tx.type === 'DEPOSIT' || tx.type === 'WIN' ? 'text-nk-green' : 'text-nk-red'}`}>
                    {tx.type === 'DEPOSIT' || tx.type === 'WIN' ? '+' : '-'}{tx.amount.toLocaleString()} KES
                  </div>
                  <div className={`text-xs ${
                    tx.status === 'SUCCESS' ? 'text-green-400' :
                    tx.status === 'FAILED' ? 'text-red-400' : 'text-yellow-400'
                  }`}>{tx.status}</div>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">No transactions yet</div>
            )}
          </div>
        </div>
      </div>
      {showDeposit && <DepositModal user={user} onClose={() => setShowDeposit(false)} />}
      <MobileNav />
    </div>
  )
}