'use client'
import { useState, useEffect } from 'react'
import { Contract, JsonRpcProvider } from 'ethers'
import { useWallet } from '@/lib/wallet'
import { CONTRACTS, INVOICE_ABI, formatFiat, formatAdi, decodeCurrency, RPC_URL } from '@/lib/contracts'
import BottomNav from '@/components/BottomNav'

interface PaidInvoice {
  invoiceId: string
  fiatAmount: bigint
  currency: string
  adiAmount: bigint
  payer: string
}

const FLAGS = ['🇺🇸','🇦🇪','🇳🇬','🇮🇩','🇧🇷','🇵🇰','🇮🇳','🇿🇦']

export default function MerchantPage() {
  const { address, connect, connecting } = useWallet()
  const [invoices, setInvoices] = useState<PaidInvoice[]>([])
  const [loading, setLoading]   = useState(false)
  const [totalAdi, setTotalAdi] = useState(0n)

  useEffect(() => { if (address) loadDashboard(address) }, [address])

  async function loadDashboard(merchant: string) {
    setLoading(true)
    try {
      const provider = new JsonRpcProvider(RPC_URL)
      const contract = new Contract(CONTRACTS.ADI_INVOICE, INVOICE_ABI, provider)
      const ids: bigint[] = await contract.getMerchantInvoices(merchant)
      const paid: PaidInvoice[] = []
      let sum = 0n
      for (const id of ids) {
        const inv = await contract.getInvoice(id)
        if (Number(inv.status) === 1) {
          paid.push({ invoiceId: id.toString(), fiatAmount: inv.fiatAmountMinor, currency: decodeCurrency(inv.currency), adiAmount: inv.adiAmount, payer: inv.payer })
          sum += inv.adiAmount
        }
      }
      setInvoices(paid)
      setTotalAdi(sum)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const xp = Math.min(invoices.length * 75 + 200, 1000)

  if (!address) return (
    <div className="page-content">
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="th-logo">TH</div>
        <span className="font-display" style={{ fontWeight: 800, fontSize: 18 }}>ThreadHunt</span>
      </div>
      <div style={{ padding: '60px 32px', textAlign: 'center' }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #E9D8FD, #C4B5F4)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>👤</div>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Your Merchant Profile</h2>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 16, lineHeight: 1.6 }}>Connect your wallet to see revenue from buyers around the world.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 28 }}>
          {FLAGS.map(f => <span key={f} style={{ fontSize: 20 }}>{f}</span>)}
        </div>
        <button className="btn-purple" onClick={connect} disabled={connecting}>{connecting ? 'Connecting…' : '🦊 Connect MetaMask'}</button>
      </div>
      <BottomNav />
    </div>
  )

  return (
    <div className="page-content">
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="th-logo">TH</div>
        <span className="font-display" style={{ fontWeight: 800, fontSize: 18 }}>ThreadHunt</span>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #6B46C1, #9F7AEA)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 28 }}>👤</div>
          <div style={{ flex: 1 }}>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 18 }}>@{address.slice(0,6)}…{address.slice(-4)}</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Merchant</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="xp-bar-track" style={{ flex: 1 }}><div className="xp-bar-fill" style={{ width: `${(xp/1000)*100}%` }} /></div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#6B46C1' }}>{xp} XP</span>
            </div>
          </div>
        </div>

        <div className="global-banner" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }} className="float">🌍</span>
            <span className="font-display" style={{ fontWeight: 700, fontSize: 15 }}>Revenue from Everywhere</span>
          </div>
          <p style={{ fontSize: 12, opacity: 0.85, marginBottom: 12 }}>Your ADI earnings come from buyers across 100+ countries — no payment processor restrictions.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>Total ADI Earned</div>
              <div className="font-display" style={{ fontWeight: 800, fontSize: 18 }}>{(Number(totalAdi)/1e18).toFixed(4)}</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>ADI</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>Sales Count</div>
              <div className="font-display" style={{ fontWeight: 800, fontSize: 18 }}>{invoices.length}</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>Transactions</div>
            </div>
          </div>
        </div>

        <div className="font-display" style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Collected ({invoices.length})</div>

        {loading && [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 72, marginBottom: 12 }} />)}

        {!loading && invoices.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <p style={{ color: '#AAA', fontSize: 14 }}>No sales yet. Share your product links so global buyers can pay in ADI!</p>
          </div>
        )}

        {!loading && invoices.map((inv, i) => (
          <div key={inv.invoiceId} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #F0F0F0' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `hsl(${260+i*20},60%,80%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✅</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Invoice #{inv.invoiceId}</div>
              <div style={{ fontSize: 12, color: '#888' }}>From: {inv.payer.slice(0,6)}…{inv.payer.slice(-4)} · {FLAGS[i % FLAGS.length]}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#6B46C1' }}>{formatAdi(inv.adiAmount)}</div>
              <div style={{ fontSize: 11, color: '#AAA' }}>{formatFiat(inv.fiatAmount, inv.currency)}</div>
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  )
}
