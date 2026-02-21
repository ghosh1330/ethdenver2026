'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

export default function TrackLandingPage() {
  const router = useRouter()
  const [tokenInput, setTokenInput] = useState('')

  return (
    <div className="page">
      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div className="th-logo"><span className="th-logo-text">TH</span></div>
        <span className="font-display" style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: 'var(--purple)', textTransform: 'uppercase' }}>ThreadHunt</span>
      </div>

      {/* Cosmic preview */}
      <div className="cosmic-bg" style={{ margin: '20px 20px 0', borderRadius: 24, height: 180, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="star" style={{
            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
            width: Math.random() * 3 + 1, height: Math.random() * 3 + 1,
            '--dur': `${2 + Math.random() * 3}s`, '--delay': `${Math.random() * 2}s`,
          } as any} />
        ))}
        <div style={{ textAlign: 'center', zIndex: 2, position: 'relative' }}>
          <div style={{ fontSize: 42, marginBottom: 8 }} className="float">🌍</div>
          <div className="font-display" style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>Track Your Package</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>On-chain NFT tracking, worldwide</div>
        </div>
      </div>

      <div style={{ padding: '24px 20px 0' }}>
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Enter Token ID</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
            Find your ShipmentNFT token ID in your order confirmation or profile.
          </p>
          <input
            type="number"
            value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            placeholder="e.g. 1"
            style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid rgba(91,63,166,0.2)', background: 'rgba(91,63,166,0.04)', fontSize: 16, marginBottom: 12, outline: 'none', fontFamily: 'Outfit, sans-serif' }}
          />
          <button
            className="btn-primary"
            disabled={!tokenInput}
            onClick={() => tokenInput && router.push(`/track/${tokenInput}`)}
          >
            Track Package
          </button>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>How NFT Tracking Works</h3>
          {[
            ['📦', 'Package Minted',   'When you pay, an NFT is minted as your package\'s digital twin'],
            ['🔗', 'On-Chain Updates', 'Seller updates status on ADI blockchain at every milestone'],
            ['🌍', 'Global Coverage',  'Track your package even where USPS/FedEx have no coverage'],
            ['✅', 'Confirm & Release','You confirm delivery — then ADI escrow releases to seller'],
          ].map(([icon, title, desc]) => (
            <div key={title as string} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
