'use client'
import { useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

const PRODUCTS = [
  { id: '1', title: 'Vintage Denim Jacket', price: 85,  currency: 'USD', condition: 'Excellent', size: 'M', location: 'Tokyo, Japan',   seller: '@fashionista',  img: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&q=80' },
  { id: '2', title: 'Off-White Sneakers',   price: 220, currency: 'USD', condition: 'Good',      size: '10', location: 'Seoul, Korea',   seller: '@kicksgod',     img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
  { id: '3', title: 'Silk Slip Dress',      price: 95,  currency: 'USD', condition: 'Like New',  size: 'S',  location: 'Paris, France',  seller: '@parisian',     img: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&q=80' },
  { id: '4', title: 'Streetwear Hoodie',    price: 130, currency: 'USD', condition: 'Good',      size: 'L',  location: 'NYC, USA',       seller: '@streetking',   img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80' },
  { id: '5', title: 'Linen Co-ord Set',     price: 340, currency: 'AED', condition: 'Excellent', size: 'M',  location: 'Dubai, UAE',     seller: '@dubai.drip',   img: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4b6e?w=400&q=80' },
  { id: '6', title: 'Leather Biker Jacket', price: 180, currency: 'USD', condition: 'Good',      size: 'M',  location: 'Lagos, Nigeria', seller: '@lagos.style',  img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80' },
]

const TAGS = ['All', 'Jackets', 'Sneakers', 'Dresses', 'Streetwear', 'Vintage']
const COUNTRIES = ['🇯🇵','🇳🇬','🇮🇩','🇧🇷','🇮🇳','🇲🇽','🇵🇰','🇿🇦','🇵🇭','🇦🇪','🇰🇷','🇫🇷']

export default function HomePage() {
  const [activeTag, setActiveTag] = useState('All')

  return (
    <div className="page">
      {/* Header */}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 40 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div className="th-logo"><span className="th-logo-text">TH</span></div>
          <span className="font-display" style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: 'var(--purple)', textTransform: 'uppercase' }}>ThreadHunt</span>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--purple-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
        </div>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        {/* Search */}
        <div className="search-bar" style={{ marginBottom: 16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>Search for items...</span>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }}>
          {TAGS.map(t => (
            <button key={t} className={`tag ${activeTag === t ? 'active' : ''}`} onClick={() => setActiveTag(t)}>{t}</button>
          ))}
        </div>

        {/* Global banner */}
        <div className="protection-card float" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>🌍</span>
            <span className="font-display" style={{ fontWeight: 700, fontSize: 17 }}>Shop Without Borders</span>
          </div>
          <p style={{ fontSize: 13, opacity: 0.88, marginBottom: 12, lineHeight: 1.55 }}>
            Your location doesn't restrict what you can buy. Pay in $ADI from anywhere — no banks, no conversion fees.
          </p>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {COUNTRIES.map(f => <span key={f} style={{ fontSize: 18 }}>{f}</span>)}
          </div>
        </div>

        {/* Discover */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>Discover</span>
          <span style={{ fontSize: 13, color: 'var(--purple)', fontWeight: 500 }}>See all</span>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
          {PRODUCTS.map(p => (
            <Link key={p.id} href={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
              <div className="product-card">
                <div style={{ height: 170, position: 'relative', overflow: 'hidden' }}>
                  <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {/* Heart */}
                  <div style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                  </div>
                  {/* NFT badge */}
                  <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(91,63,166,0.85)', borderRadius: 10, padding: '3px 8px', fontSize: 9, fontWeight: 700, color: 'white', backdropFilter: 'blur(4px)' }}>NFT TRACKED</div>
                </div>
                <div style={{ padding: '10px 12px 14px' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 3, lineHeight: 1.3, color: 'var(--text)' }}>{p.title}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--purple)' }}>
                    {p.currency === 'AED' ? 'د.إ' : '$'}{p.price} {p.currency}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
