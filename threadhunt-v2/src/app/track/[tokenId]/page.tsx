'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Contract, JsonRpcProvider } from 'ethers'
import { useWallet } from '@/lib/wallet'
import { CONTRACTS, SHIPMENT_NFT_ABI, STATUS_LABELS, STATUS_ICONS, RPC_URL } from '@/lib/contracts'
import BottomNav from '@/components/BottomNav'

interface ShipmentData {
  invoiceId: string
  seller: string
  buyer: string
  itemName: string
  origin: string
  destination: string
  status: number
  mintedAt: number
  deliveredAt: number
}

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  top:  `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 3 + 1,
  dur:  `${2 + Math.random() * 4}s`,
  delay: `${Math.random() * 3}s`,
}))

export default function TrackPage({ params }: { params: { tokenId: string } }) {
  const router = useRouter()
  const { address, signer } = useWallet()
  const [shipment, setShipment] = useState<ShipmentData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [errMsg, setErrMsg]     = useState('')
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed]   = useState(false)

  useEffect(() => { loadShipment() }, [params.tokenId])

  async function loadShipment() {
    setLoading(true)
    try {
      const provider = new JsonRpcProvider(RPC_URL)
      const nft = new Contract(CONTRACTS.SHIPMENT_NFT, SHIPMENT_NFT_ABI, provider)
      const s = await nft.getShipment(BigInt(params.tokenId))
      setShipment({
        invoiceId:   s.invoiceId.toString(),
        seller:      s.seller,
        buyer:       s.buyer,
        itemName:    s.itemName,
        origin:      s.origin,
        destination: s.destination,
        status:      Number(s.status),
        mintedAt:    Number(s.mintedAt),
        deliveredAt: Number(s.deliveredAt),
      })
    } catch (e: any) {
      setErrMsg('Could not load shipment. Make sure hardhat node is running.')
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmDelivery() {
    if (!signer || !shipment) return
    setConfirming(true)
    try {
      const { Contract } = await import('ethers')
      const { INVOICE_ABI } = await import('@/lib/contracts')
      const invoiceContract = new Contract(CONTRACTS.ADI_INVOICE, INVOICE_ABI, signer)
      await (await invoiceContract.confirmDelivery(BigInt(shipment.invoiceId))).wait()
      setConfirmed(true)
      await loadShipment()
    } catch (e: any) {
      setErrMsg(e.message?.slice(0, 100) ?? 'Failed')
    } finally {
      setConfirming(false)
    }
  }

  // Route stops based on origin → intermediate cities → destination
  const routeStops = shipment ? [
    { label: shipment.origin,  planet: '🌏', active: shipment.status >= 0 },
    { label: 'In Transit',     planet: '✈️',  active: shipment.status >= 2 },
    { label: shipment.destination, planet: '🌍', active: shipment.status >= 3 },
  ] : []

  return (
    <div className="page">
      {/* Cosmic header */}
      <div className="cosmic-bg" style={{ minHeight: 320, padding: '20px 20px 30px', position: 'relative' }}>
        {/* Stars */}
        {STARS.map(s => (
          <div key={s.id} className="star" style={{
            top: s.top, left: s.left,
            width: s.size, height: s.size,
            '--dur': s.dur, '--delay': s.delay,
          } as any} />
        ))}

        {/* Shooting stars */}
        {[0, 1.5, 3].map((d, i) => (
          <div key={i} className="shooting-star" style={{
            top: `${20 + i * 25}%`, width: `${60 + i * 20}px`,
            '--delay': `${d}s`,
          } as any} />
        ))}

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2, marginBottom: 24 }}>
          <button onClick={() => router.back()} style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div style={{ textAlign: 'center' }}>
            <div className="th-logo" style={{ margin: '0 auto 4px' }}><span className="th-logo-text">TH</span></div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>
              Track Package
            </div>
          </div>
          <div style={{ width: 38 }} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', position: 'relative', zIndex: 2 }}>
            <div className="pulse-dot" style={{ width: 10, height: 10, borderRadius: '50%', background: 'white', margin: '0 auto 12px' }} />
            Loading shipment data...
          </div>
        ) : shipment ? (
          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Item name */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: 'rgba(167,139,218,0.9)', marginBottom: 4, letterSpacing: 1 }}>NFT TOKEN #{params.tokenId}</div>
              <h2 className="font-display" style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>{shipment.itemName}</h2>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(167,139,218,0.2)', borderRadius: 20, padding: '6px 14px', marginTop: 8, backdropFilter: 'blur(8px)' }}>
                <span style={{ fontSize: 16 }}>{STATUS_ICONS[shipment.status]}</span>
                <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{STATUS_LABELS[shipment.status]}</span>
              </div>
            </div>

            {/* Planet route visualization */}
            <div style={{ position: 'relative', height: 100 }}>
              {/* SVG connecting line */}
              <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                <path d={`M 15% 50% Q 50% 15% 85% 50%`} className="orbit-path" />
              </svg>

              {/* Planet stops */}
              {routeStops.map((stop, i) => {
                const positions = ['12%', '50%', '82%']
                return (
                  <div key={i} style={{
                    position: 'absolute',
                    left: positions[i], top: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                  }}>
                    <div className={stop.active ? 'planet' : ''} style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: stop.active
                        ? 'radial-gradient(circle at 35% 35%, #A78BDA, #5B3FA6)'
                        : 'rgba(167,139,218,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, margin: '0 auto 6px',
                      border: stop.active ? '2px solid rgba(167,139,218,0.6)' : '2px solid rgba(167,139,218,0.2)',
                    }}>
                      {stop.planet}
                    </div>
                    <div style={{ fontSize: 10, color: stop.active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)', fontWeight: 500, maxWidth: 70, lineHeight: 1.3 }}>
                      {stop.label}
                    </div>
                  </div>
                )
              })}

              {/* Moving package indicator */}
              {shipment.status < 3 && (
                <div style={{
                  position: 'absolute',
                  left: shipment.status === 0 ? '20%' : shipment.status === 1 ? '40%' : '60%',
                  top: '30%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: 12, padding: '4px 10px',
                  fontSize: 11, fontWeight: 700, color: 'var(--purple)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                  transition: 'left 0.8s ease',
                }}>
                  📦 {shipment.itemName.split(' ').slice(0, 2).join(' ')}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p>{errMsg || 'No shipment found for this token.'}</p>
          </div>
        )}
      </div>

      {/* Status timeline */}
      {shipment && (
        <div style={{ padding: '20px 20px 0' }}>
          <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Journey Status</h3>

          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            {STATUS_LABELS.map((label, i) => (
              <div key={label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: i < 3 ? 16 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                  <div className={`status-dot ${i < shipment.status ? 'done' : i === shipment.status ? 'active' : ''}`} />
                  {i < 3 && <div style={{ width: 2, height: 24, background: i < shipment.status ? 'var(--purple)' : 'var(--purple-soft)', marginTop: 4 }} />}
                </div>
                <div style={{ paddingTop: 0 }}>
                  <div style={{ fontWeight: i === shipment.status ? 700 : 500, fontSize: 14, color: i <= shipment.status ? 'var(--text)' : 'var(--text-muted)' }}>
                    {STATUS_ICONS[i]} {label}
                  </div>
                  {i === shipment.status && (
                    <div style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 500, marginTop: 2 }}>
                      Current status — updated on ADI chain
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* NFT details */}
          <div className="card" style={{ padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600, letterSpacing: 0.5 }}>NFT SHIPMENT DETAILS</div>
            {[
              ['Token ID', `#${params.tokenId}`],
              ['Item', shipment.itemName],
              ['From', shipment.origin],
              ['To', shipment.destination],
              ['Seller', `${shipment.seller.slice(0,6)}…${shipment.seller.slice(-4)}`],
              ['Buyer',  `${shipment.buyer.slice(0,6)}…${shipment.buyer.slice(-4)}`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Confirm delivery button */}
          {shipment.status < 3 && address && address.toLowerCase() === shipment.buyer.toLowerCase() && !confirmed && (
            <div>
              <button className="btn-primary" onClick={handleConfirmDelivery} disabled={confirming} style={{ marginBottom: 10 }}>
                {confirming ? 'Confirming…' : '✅ I Received My Package — Release Payment'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                This releases your escrowed ADI to the seller
              </p>
            </div>
          )}

          {(confirmed || shipment.status === 3) && (
            <div style={{ background: '#F0FDF4', borderRadius: 14, padding: 16, marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#16A34A' }}>Delivery Confirmed!</div>
              <div style={{ fontSize: 13, color: '#4B7A53', marginTop: 4 }}>Payment released to seller on ADI chain</div>
            </div>
          )}

          {errMsg && (
            <div style={{ background: '#FEF2F2', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 13, color: '#DC2626' }}>{errMsg}</div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
