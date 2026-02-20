'use client'
import { useState } from 'react'
import Link from 'next/link'
import AdiCheckout from '@/components/AdiCheckout'
import BottomNav from '@/components/BottomNav'

const PRODUCTS: Record<string, { title: string; price: number; currency: string; color: string; description: string; seller: string; sellerCountry: string }> = {
  '1': { title: 'Vintage Nike Windbreaker', price: 120, currency: 'USD', color: '#C4B5F4', description: 'Rare 90s Nike windbreaker in excellent condition. Size M. Ships worldwide.', seller: 'streetwear.nyc', sellerCountry: '🇺🇸' },
  '2': { title: 'Y2K Cargo Pants',          price: 85,  currency: 'USD', color: '#A78BFA', description: 'Classic Y2K wide-leg cargo pants. Multiple pockets. Deadstock condition.', seller: 'dubai.drip', sellerCountry: '🇦🇪' },
  '3': { title: 'Streetwear Hoodie',         price: 200, currency: 'USD', color: '#8B5CF6', description: 'Limited edition collab hoodie. Heavyweight 400gsm cotton. Size L.', seller: 'lagos.fashion', sellerCountry: '🇳🇬' },
  '4': { title: 'Designer Sneakers',         price: 150, currency: 'USD', color: '#7C3AED', description: 'DS designer sneakers in original box. US10. No yellowing.', seller: 'jakarta.kicks', sellerCountry: '🇮🇩' },
  '5': { title: 'Linen Summer Set',          price: 90,  currency: 'AED', color: '#DDD6FE', description: 'Premium linen coord set. Perfect for warm climates.', seller: 'cape.closet', sellerCountry: '🇿🇦' },
  '6': { title: 'Leather Crossbody',         price: 75,  currency: 'AED', color: '#C4B5F4', description: 'Genuine leather crossbody bag. Barely used.', seller: 'manila.market', sellerCountry: '🇵🇭' },
}

export default function PayPage({ params }: { params: { invoiceId: string } }) {
  const [view, setView] = useState<'detail' | 'checkout'>('detail')
  const product = PRODUCTS[params.invoiceId]

  if (!product) {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>Item not found</h2>
      <p style={{ color: '#666', fontSize: 14 }}>Invoice ID: {params.invoiceId}</p> {/* ✅ ADD THIS */}
      <Link href="/"><button className="btn-purple" style={{ marginTop: 20 }}>Back to Home</button></Link>
    </div>
  )
}


  if (view === 'checkout') {
    return (
      <div className="page-content">
        <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => setView('detail')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A2E" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="th-logo">TH</div>
          <span className="font-display" style={{ fontWeight: 800, fontSize: 18 }}>Checkout</span>
        </div>
        <div style={{ margin: '16px 20px', display: 'flex', gap: 12, alignItems: 'center', background: '#F9F9F9', borderRadius: 14, padding: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 10, background: `linear-gradient(135deg, ${product.color}, ${product.color}88)`, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{product.title}</div>
            <div style={{ fontSize: 13, color: '#6B46C1', fontWeight: 700 }}>{product.currency === 'AED' ? 'د.إ' : '$'}{product.price} {product.currency}</div>
          </div>
        </div>
        <AdiCheckout invoiceId={params.invoiceId} />
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="page-content">
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A2E" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </Link>
        <div className="th-logo">TH</div>
        <span className="font-display" style={{ fontWeight: 800, fontSize: 18 }}>{product.title}</span>
      </div>

      <div style={{ margin: '16px 20px', borderRadius: 20, overflow: 'hidden', height: 260, background: `linear-gradient(135deg, ${product.color}, ${product.color}66)`, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>🌍</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#6B46C1' }}>Ships Worldwide</span>
        </div>
        <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{product.sellerCountry}</span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>@{product.seller}</span>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{product.title}</h1>
        <p style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{product.currency === 'AED' ? 'د.إ' : '$'}{product.price} {product.currency}</p>

        <div style={{ background: 'linear-gradient(135deg, #6B46C1, #9F7AEA)', borderRadius: 16, padding: 16, marginBottom: 20, color: 'white' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>🌍 This item accepts ADI payment</div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>Buyers from Nigeria, Brazil, Indonesia, Pakistan and 100+ countries can purchase without currency restrictions.</div>
        </div>

        <p style={{ fontSize: 14, color: '#4A4A6A', lineHeight: 1.6, marginBottom: 24 }}>{product.description}</p>

        <button className="btn-purple" style={{ marginBottom: 12 }} onClick={() => setView('checkout')}>Pay with ADI</button>
        <button className="btn-outline">Make an Offer</button>

        <div style={{ marginTop: 20, display: 'flex', gap: 16, justifyContent: 'center' }}>
          {[['🔒','On-chain receipt'],['⚡','Instant transfer'],['🌍','Global access']].map(([icon, label]) => (
            <div key={label as string} style={{ textAlign: 'center', fontSize: 11, color: '#888' }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{icon}</div>{label}
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
