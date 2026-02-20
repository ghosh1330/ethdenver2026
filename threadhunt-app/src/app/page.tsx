'use client'
import BottomNav from '@/components/BottomNav'
import { useWallet } from '@/lib/wallet'

export default function HomePage() {
  const { connect, connecting } = useWallet()
  return (
    <div className="page-content">
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="th-logo">TH</div>
        <span className="font-display" style={{ fontWeight: 800, fontSize: 18 }}>ThreadHunt</span>
      </div>
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>👕</div>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Global Streetwear</h2>
        <p style={{ color: '#888', fontSize: 14 }}>Pay in ADI from anywhere</p>
        <button className="btn-purple" onClick={connect} disabled={connecting} style={{ marginTop: 20 }}>
          {connecting ? 'Connecting…' : '🦊 Connect Wallet'}
        </button>
      </div>
      <BottomNav />
    </div>
  )
}
