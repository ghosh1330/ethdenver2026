'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useWallet } from '@/lib/wallet'
import BottomNav from '@/components/BottomNav'

const TABS = ['Listed', 'Collected', 'Liked']

const DEMO_COLLECTED = [
  { id: '1', title: 'Vintage Denim Jacket', price: '$85 USD', img: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&q=80', tokenId: '1', status: 'In Transit' },
  { id: '2', title: 'Off-White Sneakers',   price: '$220 USD', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', tokenId: '2', status: 'Delivered' },
]

export default function ProfilePage() {
  const { address, connect, connecting, disconnect } = useWallet()
  const [activeTab, setActiveTab] = useState('Collected')
  const xp = 200

  if (!address) return (
    <div className="page">
      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 40 }}>
        <div className="th-logo"><span className="th-logo-text">TH</span></div>
        <span className="font-display" style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: 'var(--purple)', textTransform: 'uppercase' }}>ThreadHunt</span>
      </div>
      <div style={{ padding: '0 32px', textAlign: 'center' }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--purple-soft)', border: '3px solid var(--purple-light)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42 }}>👤</div>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Your Profile</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6 }}>Connect your wallet to see your purchases, sales, and NFT shipment history.</p>
        <button className="btn-primary" onClick={connect} disabled={connecting}>
          {connecting ? 'Connecting…' : '🦊 Connect Wallet'}
        </button>
      </div>
      <BottomNav />
    </div>
  )

  return (
    <div className="page">
      <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ width: 36 }} />
        <div className="th-logo"><span className="th-logo-text">TH</span></div>
        <button onClick={disconnect} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Outfit, sans-serif' }}>Disconnect</button>
      </div>

      {/* Profile card */}
      <div className="card" style={{ margin: '0 20px 16px', padding: 24, textAlign: 'center' }}>
        <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--purple-soft)', border: '3px solid var(--purple-light)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38 }}>👤</div>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 2 }}>@{address.slice(0,6)}…{address.slice(-4)}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>ThreadHunt Member</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div className="xp-track" style={{ flex: 1 }}>
            <div className="xp-fill" style={{ width: `${(xp / 1000) * 100}%` }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple)', whiteSpace: 'nowrap' }}>{xp} XP</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 18 }}>
          {[['0', 'Listed'], ['2', 'Collected'], ['0', 'Liked']].map(([n, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--purple)' }}>{n}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* My Purchases button */}
        <Link href="/purchases" style={{ textDecoration: 'none' }}>
          <button style={{
            width: '100%', padding: '13px 0',
            background: 'var(--purple)', color: 'white',
            border: 'none', borderRadius: 14,
            fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            🛍️ My Purchases
          </button>
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #EDE8F5', margin: '0 20px', marginBottom: 20 }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 500,
            color: activeTab === tab ? 'var(--purple)' : 'var(--text-muted)',
            borderBottom: activeTab === tab ? '2px solid var(--purple)' : '2px solid transparent',
            marginBottom: -1, transition: 'all 0.15s',
          }}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 20px' }}>
        {activeTab === 'Collected' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {DEMO_COLLECTED.map(item => (
              <div key={item.id} className="product-card">
                <div style={{ height: 150, overflow: 'hidden', position: 'relative' }}>
                  <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 8, left: 8, background: item.status === 'Delivered' ? '#16A34A' : 'var(--purple)', borderRadius: 10, padding: '2px 8px', fontSize: 9, fontWeight: 700, color: 'white' }}>
                    {item.status === 'Delivered' ? '✅ Delivered' : '✈️ ' + item.status}
                  </div>
                </div>
                <div style={{ padding: '10px 12px 14px' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 700, marginBottom: 8 }}>{item.price}</p>
                  <Link href={`/track/${item.tokenId}`}>
                    <button style={{ width: '100%', padding: '7px 0', borderRadius: 10, background: 'var(--purple-soft)', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: 'var(--purple)', fontFamily: 'Outfit, sans-serif' }}>
                      Track →
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'Listed' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏷️</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No items listed yet.</p>
            <Link href="/sell"><button className="btn-primary" style={{ marginTop: 16, width: 'auto', padding: '12px 24px' }}>List an Item</button></Link>
          </div>
        )}
        {activeTab === 'Liked' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>❤️</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No liked items yet.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
