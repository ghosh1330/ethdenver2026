import type { Metadata } from 'next'
import './globals.css'
import { WalletProvider } from '@/lib/wallet'

export const metadata: Metadata = {
  title: 'ThreadHunt — Global Fashion on ADI Chain',
  description: 'Buy and sell secondhand clothing worldwide. Escrow protection + NFT package tracking.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <div className="app-shell">{children}</div>
        </WalletProvider>
      </body>
    </html>
  )
}
