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

// Route stops for the snake path — origin → hubs → destination
const ROUTE_STOPS = [
  { label: 'Tokyo', x: 22, y: 18 },
  { label: 'Egypt', x: 68, y: 38 },
  { label: 'Mexico', x: 25, y: 60 },
  { label: 'United States', x: 68, y: 80 },
]

// SVG snake path connecting all 4 stops
const SNAKE_PATH = `M 22% 18% C 45% 20%, 55% 32%, 68% 38% C 80% 44%, 40% 52%, 25% 60% C 10% 68%, 45% 74%, 68% 80%`

export default function TrackPage({ params }: { params: { tokenId: string } }) {
  const router = useRouter()
  const { address, signer } = useWallet()
  const [shipment, setShipment]     = useState<ShipmentData | null>(null)
  const [loading, setLoading]       = useState(true)
  const [errMsg, setErrMsg]         = useState('')
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed]   = useState(false)

  useEffect(() => { loadShipment() }, [params.tokenId])

  async function loadShipment() {
    setLoading(true)
    try {
      const provider = new JsonRpcProvider(RPC_URL)
      const nft = new Contract(CONTRACTS.SHIPMENT_NFT, SHIPMENT_NFT_ABI, provider)
      const s   = await nft.getShipment(BigInt(params.tokenId))
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

  // Current active stop index based on status
  // status: 0=Packed, 1=Shipped, 2=InTransit, 3=Delivered
  const activeStop = Math.min(shipment?.status ?? 0, ROUTE_STOPS.length - 1)

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>

      {/* ── Cosmic tracking map ───────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg, #E8E4F4 0%, #D8D0EE 40%, #E4E0F0 100%)',
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(167,139,218,0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(91,63,166,0.1) 0%, transparent 50%)
        `,
        minHeight: 560,
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Repeating star/ripple texture overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Cpath d='M30 0l2 8-2 2-2-2zM60 30l-8 2-2-2 2-2zM30 60l-2-8 2-2 2 2zM0 30l8-2 2 2-2 2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.6,
        }} />

        {/* Header */}
        <div style={{ padding: '20px 20px 0', position: 'relative', zIndex: 2 }}>
          <button onClick={() => router.back()} style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', marginBottom: 16 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1030" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="font-display" style={{ fontSize: 32, fontWeight: 700, color: '#2A1F4A', marginBottom: 0 }}>Track Your Package</h1>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', position: 'relative', zIndex: 2 }}>
            <div className="pulse-dot" style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--purple)', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading shipment data...</p>
          </div>
        ) : shipment ? (
          <div style={{ position: 'relative', zIndex: 2, height: 440 }}>

            {/* ── Shooting star indicator (item popup) ── */}
            <div style={{
              position: 'absolute',
              top: '12%', left: '38%',
              zIndex: 10,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {/* Shooting star icon */}
              <div style={{ position: 'relative', width: 52, height: 52 }}>
                {/* Trails */}
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    position: 'absolute',
                    width: 18 - i*4, height: 3,
                    background: 'var(--purple)',
                    borderRadius: 2,
                    top: `${30 + i*12}%`,
                    left: `${-20 - i*8}%`,
                    transform: 'rotate(-40deg)',
                    opacity: 1 - i*0.25,
                  }} />
                ))}
                {/* Star */}
                <svg width="36" height="36" viewBox="0 0 24 24" style={{ position: 'absolute', top: '10%', left: '20%' }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="var(--purple)" stroke="var(--purple-light)" strokeWidth="0.5"/>
                </svg>
              </div>
              {/* Popup */}
              <div style={{
                background: 'rgba(255,255,255,0.92)',
                borderRadius: 16, padding: '10px 14px',
                boxShadow: '0 4px 20px rgba(91,63,166,0.15)',
                backdropFilter: 'blur(8px)',
                minWidth: 140,
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1030', marginBottom: 2 }}>{shipment.itemName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {shipment.status === 0 ? 'Packed at facility' :
                   shipment.status === 1 ? 'Left Facility at 14:07' :
                   shipment.status === 2 ? 'In transit' : 'Delivered ✅'}
                </div>
              </div>
            </div>

            {/* ── SVG snake path ── */}
            <svg
              width="100%" height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              {/* Shadow path */}
              <path
                d="M 22 20 C 40 22, 58 34, 68 40 C 80 46, 38 54, 25 62 C 12 70, 46 75, 68 82"
                fill="none"
                stroke="rgba(0,0,0,0.12)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              {/* Main path */}
              <path
                d="M 22 20 C 40 22, 58 34, 68 40 C 80 46, 38 54, 25 62 C 12 70, 46 75, 68 82"
                fill="none"
                stroke="#1A1030"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
            </svg>

            {/* ── Planet stops ── */}
            {ROUTE_STOPS.map((stop, i) => {
              const isActive  = i === activeStop
              const isDone    = i < activeStop
              const isPending = i > activeStop

              return (
                <div key={stop.label} style={{
                  position: 'absolute',
                  left: `${stop.x}%`,
                  top:  `${stop.y}%`,
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  zIndex: 5,
                }}>
                  {/* Planet */}
                  <div className={isActive ? 'planet' : ''} style={{
                    width: 80, height: 80,
                    borderRadius: '50%',
                    background: isPending
                      ? 'radial-gradient(circle at 35% 30%, #C4B8E8, #9B8AC4)'
                      : 'radial-gradient(circle at 35% 30%, #B8A8E8, #7B5CC6)',
                    position: 'relative',
                    margin: '0 auto 8px',
                    boxShadow: isActive
                      ? '0 0 24px rgba(91,63,166,0.5), inset 0 -8px 16px rgba(0,0,0,0.2)'
                      : 'inset 0 -6px 12px rgba(0,0,0,0.15)',
                    opacity: isPending ? 0.65 : 1,
                  }}>
                    {/* Ring */}
                    <div style={{
                      position: 'absolute',
                      top: '42%', left: '-18%',
                      width: '136%', height: '22%',
                      borderRadius: '50%',
                      border: `3px solid ${isPending ? 'rgba(91,63,166,0.4)' : 'rgba(91,63,166,0.75)'}`,
                      transform: 'rotateX(70deg)',
                    }} />
                  </div>
                  {/* Label */}
                  <div className="font-display" style={{
                    fontSize: 16, fontWeight: 700,
                    color: isPending ? '#9B8AC4' : '#1A1030',
                  }}>{stop.label}</div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ color: 'var(--text-muted)' }}>{errMsg || 'No shipment found for this token.'}</p>
          </div>
        )}
      </div>

      {/* ── Status timeline below map ─────────────────────────────────── */}
      {shipment && (
        <div style={{ padding: '20px 20px 0' }}>
          <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Journey Status</h3>

          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            {STATUS_LABELS.map((label, i) => (
              <div key={label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: i < 3 ? 16 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className={`status-dot ${i < shipment.status ? 'done' : i === shipment.status ? 'active' : ''}`} />
                  {i < 3 && <div style={{ width: 2, height: 24, background: i < shipment.status ? 'var(--purple)' : 'var(--purple-soft)', marginTop: 4 }} />}
                </div>
                <div>
                  <div style={{ fontWeight: i === shipment.status ? 700 : 500, fontSize: 14, color: i <= shipment.status ? 'var(--text)' : 'var(--text-muted)' }}>
                    {STATUS_ICONS[i]} {label}
                  </div>
                  {i === shipment.status && (
                    <div style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 500, marginTop: 2 }}>Current status — recorded on ADI chain</div>
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

          {/* Confirm delivery */}
          {shipment.status < 3 && address && address.toLowerCase() === shipment.buyer.toLowerCase() && !confirmed && (
            <div>
              <button className="btn-primary" onClick={handleConfirmDelivery} disabled={confirming} style={{ marginBottom: 10 }}>
                {confirming ? 'Confirming…' : '✅ I Received My Package — Release Payment'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>This releases your escrowed ADI to the seller</p>
            </div>
          )}

          {(confirmed || shipment.status === 3) && (
            <div style={{ background: '#F0FDF4', borderRadius: 14, padding: 16, marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#16A34A' }}>Delivery Confirmed!</div>
              <div style={{ fontSize: 13, color: '#4B7A53', marginTop: 4 }}>Payment released to seller on ADI chain</div>
            </div>
          )}

          {errMsg && <div style={{ background: '#FEF2F2', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 13, color: '#DC2626' }}>{errMsg}</div>}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
