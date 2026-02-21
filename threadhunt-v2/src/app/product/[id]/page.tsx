'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

const PRODUCTS: Record<string, {
  title: string; price: number; currency: string; condition: string;
  size: string; location: string; seller: string; description: string;
  img: string; origin: string; shipping: number;
}> = {
  '1': { title: 'Vintage Denim Jacket', price: 85, currency: 'USD', condition: 'Excellent', size: 'Medium', location: 'Tokyo, Japan', seller: '@fashionista', description: 'Classic 90s denim jacket in excellent condition. Perfect vintage wash with minimal wear. Double stitching, original buttons intact. A true wardrobe staple that ships worldwide.', img: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=80', origin: 'Tokyo, Japan', shipping: 15 },
  '2': { title: 'Off-White Sneakers',   price: 220, currency: 'USD', condition: 'Good',      size: 'US 10',  location: 'Seoul, Korea',   seller: '@kicksgod',    description: 'Deadstock Off-White x Nike collab. Original box included. Light creasing on toe box. Authenticated. Global shipping with NFT tracking.', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', origin: 'Seoul, Korea', shipping: 20 },
  '3': { title: 'Silk Slip Dress',      price: 95,  currency: 'USD', condition: 'Like New',  size: 'Small',  location: 'Paris, France',  seller: '@parisian',    description: 'Elegant silk slip dress, barely worn. Perfect for evenings. Hand-wash only. Ships from Paris with love. Your location doesn\'t matter — ADI makes it global.', img: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80', origin: 'Paris, France', shipping: 18 },
  '4': { title: 'Streetwear Hoodie',    price: 130, currency: 'USD', condition: 'Good',      size: 'Large',  location: 'NYC, USA',       seller: '@streetking',  description: 'Limited drop heavyweight hoodie. 400gsm cotton. Slightly pilled interior from washing. Still looks heat. Ships internationally via NFT-tracked shipment.', img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80', origin: 'New York, USA', shipping: 12 },
  '5': { title: 'Linen Co-ord Set',     price: 340, currency: 'AED', condition: 'Excellent', size: 'Medium', location: 'Dubai, UAE',     seller: '@dubai.drip',  description: 'Premium linen coordinate set. Perfect for warm climates. Barely worn, no damage. Buyers from Nigeria, Pakistan, Indonesia — pay in ADI, no conversion needed.', img: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4b6e?w=800&q=80', origin: 'Dubai, UAE', shipping: 22 },
  '6': { title: 'Leather Biker Jacket', price: 180, currency: 'USD', condition: 'Good',      size: 'Medium', location: 'Lagos, Nigeria', seller: '@lagos.style', description: 'Genuine leather biker jacket. Worn twice. Ships worldwide — no payment processor can block your purchase when you pay in ADI.', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', origin: 'Lagos, Nigeria', shipping: 25 },
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const product = PRODUCTS[params.id]

  if (!product) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <p>Product not found</p>
      <Link href="/"><button className="btn-primary" style={{ marginTop: 20 }}>Back</button></Link>
    </div>
  )

  const total = product.price + product.shipping + 5 // platform fee

  return (
    <div className="page fadein">
      {/* Header */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => router.back()} style={{ width: 38, height: 38, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="th-logo" style={{ width: 44, height: 44 }}><span className="th-logo-text">TH</span></div>
        <div style={{ width: 38 }} />
      </div>

      {/* Image */}
      <div style={{ margin: '0 20px', borderRadius: 24, overflow: 'hidden', height: 300, position: 'relative' }}>
        <img src={product.img} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 14, right: 14, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {/* Title & price */}
        <div className="card" style={{ padding: 20, marginBottom: 14 }}>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>{product.title}</h1>
          <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--purple)', marginBottom: 16 }}>
            {product.currency === 'AED' ? 'د.إ' : '$'}{product.price} {product.currency}
          </p>

          {/* Specs grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 0', marginBottom: 14 }}>
            {[['Condition', product.condition], ['Size', product.size], ['Location', product.location], ['Seller', product.seller]].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #F0EAF8', paddingTop: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Description</div>
            <p style={{ fontSize: 14, color: '#4A3A6A', lineHeight: 1.6 }}>{product.description}</p>
          </div>
        </div>

        {/* Blockchain Protection Card */}
        <div className="protection-card" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontWeight: 700, fontSize: 17 }}>Blockchain Protection</span>
          </div>
          {[
            { icon: '🔒', title: 'Smart Contract Guarantee', desc: 'Your payment is held securely in escrow until delivery is confirmed' },
            { icon: '📦', title: 'NFT Package Tracking',    desc: 'Receive an NFT to track your package in real-time throughout its journey' },
            { icon: '🛡️', title: 'Automatic Refund Protection', desc: 'If package doesn\'t arrive, funds are automatically returned to your wallet' },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 12, marginTop: 4 }}>
            <p style={{ fontSize: 12, opacity: 0.7, textAlign: 'center' }}>
              All transactions are recorded on-chain for complete transparency and security
            </p>
          </div>
        </div>

        {/* Buttons */}
        <Link href={`/order/${params.id}`}>
          <button className="btn-primary" style={{ marginBottom: 12 }}>Pay in ADI</button>
        </Link>
        <button className="btn-outline" style={{ marginBottom: 20 }}>Make Offer</button>
      </div>

      <BottomNav />
    </div>
  )
}
