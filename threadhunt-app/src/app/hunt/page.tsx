'use client'
import BottomNav from '@/components/BottomNav'
export default function HuntPage() {
  return (
    <div className="page-content">
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="th-logo">TH</div>
        <span className="font-display" style={{ fontWeight: 800, fontSize: 18 }}>Hunt</span>
      </div>
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Hunt Mode</h2>
        <p style={{ color: '#888', fontSize: 14 }}>Search for items from sellers worldwide. Pay in ADI, no matter where they are.</p>
      </div>
      <BottomNav />
    </div>
  )
}
