import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Nairobi King — Flip',
  description: 'The ultimate Nairobi card flip betting experience',
  icons: { icon: '/crown.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-nk-black text-white font-outfit antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A0000',
              color: '#fff',
              border: '1px solid #D4AF3744',
              fontFamily: 'Outfit, sans-serif',
            },
            success: { iconTheme: { primary: '#27AE60', secondary: '#fff' } },
            error: { iconTheme: { primary: '#C0392B', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}