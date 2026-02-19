'use client'
import BottomNav from '@/components/BottomNav'
export default function SellPage() {
  return (
    <div className="page-content">
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="th-logo">TH</div>
        <span className="font-display" style={{ fontWeight: 800, fontSize: 18 }}>Sell</span>
      </div>
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏷️</div>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>List an Item</h2>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>Price in USD or AED. Buyers from anywhere pay you in ADI.</p>
        <div style={{ background: '#F9F5FF', borderRadius: 16, padding: 20, textAlign: 'left' }}>
          {[['🌍','Reach buyers in 100+ countries'],['💱','Price in USD or AED'],['⚡','Receive ADI instantly'],['🔒','Every sale recorded on-chain']].map(([icon,text]) => (
            <div key={text as string} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
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
