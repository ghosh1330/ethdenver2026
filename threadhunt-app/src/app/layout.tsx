import type { Metadata } from 'next'
import './globals.css'
import { WalletProvider } from '@/lib/wallet'

export const metadata: Metadata = {
  title: 'ThreadHunt — Global Fashion, Zero Borders',
  description: 'Buy and sell streetwear worldwide. Pay in ADI, no matter where you are.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <div className="mobile-container">{children}</div>
        </WalletProvider>
      </body>
    </html>
  )
}
