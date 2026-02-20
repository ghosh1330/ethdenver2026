'use client'
import { useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

const PRODUCTS = [
  { id: 1, title: 'Vintage Nike Windbreaker', price: 120, currency: 'USD', color: '#C4B5F4' },
  { id: 2, title: 'Y2K Cargo Pants',          price: 85,  currency: 'USD', color: '#A78BFA' },
  { id: 3, title: 'Streetwear Hoodie',         price: 200, currency: 'USD', color: '#8B5CF6' },
  { id: 4, title: 'Designer Sneakers',         price: 150, currency: 'USD', color: '#7C3AED' },
  { id: 5, title: 'Linen Summer Set',          price: 90,  currency: 'AED', color: '#DDD6FE' },
  { id: 6, title: 'Leather Crossbody',         price: 75,  currency: 'AED', color: '#C4B5F4' },
]

const TAGS = ['All', 'Sneakers', 'Jackets', 'Vintage', 'Streetwear']
const COUNTRIES = ['🇧🇷','🇳🇬','🇮🇩','🇵🇰','🇲🇽','🇮🇳','🇿🇦','🇵🇭','🇪🇬','🇹🇷','🇦🇪','🇺🇸']

export default function HomePage() {
  const [activeTag, setActiveTag] = useState('All')

  return (
    <div className="page-content">
      <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="th-logo">TH</div>
        <span className="font-display" style={{ fontSize: 20, fontWeight: 800 }}>ThreadHunt</span>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #6B46C1, #9F7AEA)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>0</div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div className="search-bar" style={{ marginBottom: 16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>Search...</span>
        </div>

        <div className="global-banner float" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>🌍</span>
            <span className="font-display" style={{ fontWeight: 700, fontSize: 16 }}>Shop Without Borders</span>
          </div>
          <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 12, lineHeight: 1.5 }}>
            Your location doesn't limit what you can buy. Pay in $ADI from anywhere — no bank needed.
          </p>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {COUNTRIES.map(f => <span key={f} style={{ fontSize: 18 }}>{f}</span>)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }}>
          {TAGS.map(t => (
            <button key={t} className={`tag ${activeTag === t ? 'active' : ''}`} onClick={() => setActiveTag(t)}>{t}</button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span className="font-display" style={{ fontWeight: 700, fontSize: 18 }}>Home / Discover</span>
          <span style={{ fontSize: 13, color: '#6B46C1', fontWeight: 500 }}>See all</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {PRODUCTS.map(p => (
            <Link key={p.id} href={`/pay/${p.id}`} style={{ textDecoration: 'none' }}>
              <div className="product-card">
                <div style={{ height: 160, background: `linear-gradient(135deg, ${p.color}, ${p.color}AA)`, position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: 10, right: 10, width: 30, height: 30, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B46C1" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                  </div>
                  <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 600, color: '#6B46C1' }}>🌍 Global</div>
                </div>
                <div style={{ padding: '10px 12px 14px' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{p.title}</p>
                  <p style={{ fontSize: 13, color: '#6B46C1', fontWeight: 700 }}>{p.currency === 'AED' ? 'د.إ' : '$'}{p.price} {p.currency}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ background: '#F9F5FF', borderRadius: 20, padding: 20, marginBottom: 20 }}>
          <h3 className="font-display" style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: '#44337A' }}>Why ThreadHunt uses ADI</h3>
          {[['🚫','No Visa/Mastercard restrictions'],['💱','No currency conversion fees'],['⚡','Instant settlement, any country'],['🔒','On-chain receipt for every purchase']].map(([icon, text]) => (
            <div key={text as string} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ fontSize: 14, color: '#4A4A6A' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}