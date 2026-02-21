'use client'
import BottomNav from '@/components/BottomNav'

export default function SellPage() {
  return (
    <div className="page">
      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 20 }}>
        <div className="th-logo"><span className="th-logo-text">TH</span></div>
        <span className="font-display" style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: 'var(--purple)', textTransform: 'uppercase' }}>ThreadHunt</span>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🏷️</div>
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Sell Your Clothes</h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            List your items. Get paid in ADI by buyers from 100+ countries.
          </p>
        </div>

        <div className="protection-card" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>🌍 Reach Global Buyers</div>
          {[
            ['💱', 'Price in USD or AED'],
            ['⚡', 'Get paid in ADI instantly'],
            ['🔒', 'Every sale on-chain'],
            ['📦', 'NFT tracking for every shipment'],
            ['🛡️', 'Escrow protects both parties'],
          ].map(([icon, text]) => (
            <div key={text as string} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ fontSize: 14 }}>{text}</span>
            </div>
          ))}
        </div>

        <button className="btn-primary" style={{ marginBottom: 12 }}>📷 List an Item</button>
        <button className="btn-outline">Learn How It Works</button>
      </div>

      <BottomNav />
    </div>
  )
}
