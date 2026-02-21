'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { useWallet } from '@/lib/wallet'

const DEMO_PURCHASES = [
  {
    id: '1', tokenId: '1',
    title: 'Vintage Denim Jacket',
    price: '$85 USD',
    condition: 'Excellent', size: 'Medium',
    location: 'Tokyo, Japan', seller: '@fashionista',
    description: 'Classic 90s denim jacket in excellent condition. Perfect vintage wash with minimal wear.',
    img: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&q=80',
    status: 'In Transit',
  },
  {
    id: '2', tokenId: '2',
    title: 'Off-White Sneakers',
    price: '$220 USD',
    condition: 'Good', size: 'US 10',
    location: 'Seoul, Korea', seller: '@kicksgod',
    description: 'Deadstock Off-White collab. Original box included.',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    status: 'Delivered',
  },
]

export default function PurchasesPage() {
  const router = useRouter()
  const { address, connect, connecting } = useWallet()

  if (!address) return (
    <div className="page">
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ width: 38, height: 38, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="font-display" style={{ fontSize: 22, fontWeight: 700 }}>My Purchases</h1>
      </div>
      <div style={{ padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Connect your wallet to see your purchases.</p>
        <button className="btn-primary" onClick={connect} disabled={connecting}>{connecting ? 'Connecting…' : '🦊 Connect Wallet'}</button>
      </div>
      <BottomNav />
    </div>
  )

  return (
    <div className="page">
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <button onClick={() => router.back()} style={{ width: 38, height: 38, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h1 className="font-display" style={{ fontSize: 22, fontWeight: 700 }}>My Purchases</h1>
      </div>

      <div style={{ padding: '12px 20px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--purple-soft)', flexShrink: 0 }} />
        <span style={{ fontWeight: 600, fontSize: 16 }}>{address.slice(0,6)}…{address.slice(-4)}</span>
      </div>

      {/* Recent Purchases horizontal scroll */}
      <div style={{ paddingLeft: 20, marginBottom: 24 }}>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Recent Purchases</h2>
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingRight: 20, paddingBottom: 4 }}>
          {DEMO_PURCHASES.map(p => (
            <Link key={p.id} href={`/track/${p.tokenId}`} style={{ textDecoration: 'none' }}>
              <div style={{ width: 160, height: 160, borderRadius: 20, background: 'white', flexShrink: 0, overflow: 'hidden', boxShadow: '0 2px 12px rgba(91,63,166,0.08)' }}>
                <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </Link>
          ))}
          <div style={{ width: 160, height: 160, borderRadius: 20, background: 'white', flexShrink: 0, boxShadow: '0 2px 12px rgba(91,63,166,0.06)' }} />
          <div style={{ width: 160, height: 160, borderRadius: 20, background: 'white', flexShrink: 0, boxShadow: '0 2px 12px rgba(91,63,166,0.06)' }} />
        </div>
      </div>

      {/* Just Purchased */}
      <div style={{ background: 'rgba(91,63,166,0.05)', borderRadius: '24px 24px 0 0', padding: '24px 20px 0', minHeight: 300 }}>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Just Purchased</h2>

        {DEMO_PURCHASES.map(purchase => (
          <div key={purchase.id} className="card" style={{ padding: 16, marginBottom: 14, borderRadius: 20 }}>
            <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
              <img src={purchase.img} alt={purchase.title} style={{ width: 90, height: 90, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{purchase.title}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--purple)', marginBottom: 10 }}>{purchase.price}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[['Condition', purchase.condition], ['Size', purchase.size], ['Location', purchase.location], ['Seller', purchase.seller]].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      <span style={{ background: 'white', border: '1.5px solid rgba(91,63,166,0.15)', borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 700, color: 'var(--purple)' }}>{k}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--purple)', lineHeight: 1.5, marginBottom: 14 }}>{purchase.description}</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="28" height="28" viewBox="0 0 28 28">
                  <line x1="4" y1="24" x2="10" y2="18" stroke="var(--purple)" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="4" y1="18" x2="8" y2="14" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                  <path d="M14 4l2.5 5 5.5.8-4 3.9.94 5.48L14 16.5l-4.94 2.68.94-5.48-4-3.9 5.5-.8z" fill="var(--purple)"/>
                </svg>
                <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--purple)', fontFamily: 'Playfair Display, serif', fontStyle: 'italic' }}>On Route!</span>
              </div>
              <Link href={`/track/${purchase.tokenId}`}>
                <button style={{ background: 'rgba(91,63,166,0.06)', border: '1.5px solid rgba(91,63,166,0.12)', borderRadius: 20, padding: '8px 18px', fontSize: 13, fontWeight: 600, color: 'var(--text)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                  Track Location
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
