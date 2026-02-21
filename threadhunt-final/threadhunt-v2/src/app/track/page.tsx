'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

const DEMO_PURCHASES = [
  { id: '1', tokenId: '1', title: 'Vintage Denim Jacket', price: '$85 USD', img: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&q=80', status: 'In Transit' },
  { id: '2', tokenId: '2', title: 'Off-White Sneakers',   price: '$220 USD', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', status: 'Delivered' },
]

export default function TrackLandingPage() {
  const router = useRouter()
  const [tokenInput, setTokenInput] = useState('')

  return (
    <div className="page">
      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 20 }}>
        <div className="th-logo"><span className="th-logo-text">TH</span></div>
        <span className="font-display" style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: 'var(--purple)', textTransform: 'uppercase' }}>ThreadHunt</span>
      </div>

      {/* Cosmic preview */}
      <div style={{
        margin: '0 20px 20px', borderRadius: 24, height: 160, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #E8E4F4, #C8B8E8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', zIndex: 2, position: 'relative' }}>
          <div style={{ fontSize: 42, marginBottom: 8 }} className="float">🪐</div>
          <div className="font-display" style={{ color: 'var(--purple)', fontSize: 18, fontWeight: 700 }}>Track Your Package</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>On-chain NFT tracking, worldwide</div>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* Token ID search */}
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Enter Token ID</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>Find your ShipmentNFT token ID in your order confirmation.</p>
          <input
            type="number" value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            placeholder="e.g. 1"
            style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: '1.5px solid rgba(91,63,166,0.2)', background: 'rgba(91,63,166,0.04)', fontSize: 16, marginBottom: 12, outline: 'none', fontFamily: 'Outfit, sans-serif' }}
          />
          <button className="btn-primary" disabled={!tokenInput} onClick={() => tokenInput && router.push(`/track/${tokenInput}`)}>
            Track Package
          </button>
        </div>

        {/* My active shipments */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700 }}>Active Shipments</h3>
            <Link href="/purchases" style={{ fontSize: 13, color: 'var(--purple)', fontWeight: 500, textDecoration: 'none' }}>View all</Link>
          </div>

          {DEMO_PURCHASES.map(p => (
            <Link key={p.id} href={`/track/${p.tokenId}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 14, marginBottom: 12, display: 'flex', gap: 14, alignItems: 'center' }}>
                <img src={p.img} alt={p.title} style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{p.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--purple)', fontWeight: 700 }}>{p.price}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{
                    background: p.status === 'Delivered' ? '#DCFCE7' : 'var(--purple-soft)',
                    color: p.status === 'Delivered' ? '#16A34A' : 'var(--purple)',
                    borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                  }}>
                    {p.status === 'Delivered' ? '✅ Delivered' : '✈️ ' + p.status}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Token #{p.tokenId}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* How it works */}
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>How NFT Tracking Works</h3>
          {[
            ['📦', 'Package Minted',   'When you pay, an NFT is minted as your package\'s digital twin'],
            ['🔗', 'On-Chain Updates', 'Seller updates status on ADI blockchain at every milestone'],
            ['🌍', 'Global Coverage',  'Track your package even where USPS/FedEx have no coverage'],
            ['✅', 'Confirm & Release','You confirm delivery — escrow releases to seller'],
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
