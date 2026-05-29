'use client'
import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: string
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative bg-[#0D0000] border border-[#D4AF3722] rounded-2xl p-6 w-full ${maxWidth} shadow-2xl animate-slide-up`}
      >
        {title && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1A0000] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1A0000] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        )}
        {children}
      </div>
    </div>
  )
}