'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/lib/wallet'
import { CONTRACTS, INVOICE_ABI, ERC20_ABI, formatAdi, RPC_URL } from '@/lib/contracts'
import BottomNav from '@/components/BottomNav'
import QRCode from '@/components/QRCode'

const PRODUCTS: Record<string, { title: string; price: number; currency: string; location: string; seller: string; img: string; origin: string }> = {
  '1': { title: 'Vintage Denim Jacket', price: 85,  currency: 'USD', location: 'Tokyo, Japan',   seller: '@fashionista', img: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=200&q=80', origin: 'Tokyo, Japan' },
  '2': { title: 'Off-White Sneakers',   price: 220, currency: 'USD', location: 'Seoul, Korea',   seller: '@kicksgod',    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80', origin: 'Seoul, Korea' },
  '3': { title: 'Silk Slip Dress',      price: 95,  currency: 'USD', location: 'Paris, France',  seller: '@parisian',    img: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=200&q=80', origin: 'Paris, France' },
  '4': { title: 'Streetwear Hoodie',    price: 130, currency: 'USD', location: 'NYC, USA',       seller: '@streetking',  img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=200&q=80', origin: 'New York, USA' },
  '5': { title: 'Linen Co-ord Set',     price: 340, currency: 'AED', location: 'Dubai, UAE',     seller: '@dubai.drip',  img: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4b6e?w=200&q=80', origin: 'Dubai, UAE' },
  '6': { title: 'Leather Biker Jacket', price: 180, currency: 'USD', location: 'Lagos, Nigeria', seller: '@lagos.style', img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&q=80', origin: 'Lagos, Nigeria' },
}

const SHIPPING_FEE = 15
const PLATFORM_FEE = 5

type Step = 'idle' | 'approving' | 'paying' | 'done'
type PayMethod = 'wallet' | 'qr'

export default function OrderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { address, signer, connect, connecting } = useWallet()
  const product = PRODUCTS[params.id]
  const [step, setStep]           = useState<Step>('idle')
  const [payMethod, setPayMethod] = useState<PayMethod>('wallet')
  const [errMsg, setErrMsg]       = useState('')
  const [tokenId, setTokenId]     = useState<string | null>(null)
  const [adiQuote, setAdiQuote]   = useState<bigint>(0n)

  const total      = (product?.price ?? 0) + SHIPPING_FEE + PLATFORM_FEE
  const totalMinor = BigInt(total * 100)

  const qrValue = adiQuote > 0n
    ? `ethereum:${CONTRACTS.ADI_TOKEN}/transfer?address=${CONTRACTS.ADI_INVOICE}&uint256=${adiQuote.toString()}`
    : CONTRACTS.ADI_INVOICE

  useEffect(() => {
    if (!product) return
    async function getQuote() {
      try {
        const { JsonRpcProvider, Contract } = await import('ethers')
        const { ORACLE_ABI } = await import('@/lib/contracts')
        const provider = new JsonRpcProvider(RPC_URL)
        const oracle   = new Contract(CONTRACTS.ORACLE_ADAPTER, ORACLE_ABI, provider)
        const currency = product.currency === 'AED'
          ? '0x4145440000000000000000000000000000000000000000000000000000000000'
          : '0x5553440000000000000000000000000000000000000000000000000000000000'
        const quote = await oracle.getQuote(totalMinor, currency)
        setAdiQuote(quote)
      } catch {}
    }
    getQuote()
  }, [product, totalMinor])

  if (!product) return <div style={{ padding: 40, textAlign: 'center' }}>Not found</div>

  const handlePurchase = async () => {
    if (!address) { await connect(); return }
    if (!signer) return
    setErrMsg('')
    try {
      const { Contract } = await import('ethers')
      setStep('approving')
      const currency = product.currency === 'AED'
        ? '0x4145440000000000000000000000000000000000000000000000000000000000'
        : '0x5553440000000000000000000000000000000000000000000000000000000000'
      const invoiceContract = new Contract(CONTRACTS.ADI_INVOICE, INVOICE_ABI, signer)
      const createTx        = await invoiceContract.createInvoice(address, totalMinor, currency, 0)
      const createReceipt   = await createTx.wait()
      let invoiceId = '1'
      for (const log of createReceipt.logs) {
        try {
          const parsed = invoiceContract.interface.parseLog(log)
          if (parsed?.name === 'InvoiceCreated') { invoiceId = parsed.args.invoiceId.toString(); break }
        } catch {}
      }
      const [adiAmount] = await invoiceContract.quoteInvoice(invoiceId)
      const token = new Contract(CONTRACTS.ADI_TOKEN, ERC20_ABI, signer)
      await (await token.approve(CONTRACTS.ADI_INVOICE, adiAmount)).wait()
      setStep('paying')
      const payTx      = await invoiceContract.payInvoice(invoiceId, product.title, product.origin, 'Your Destination')
      const payReceipt = await payTx.wait()
      for (const log of payReceipt.logs) {
        try {
          const parsed = invoiceContract.interface.parseLog(log)
          if (parsed?.name === 'InvoicePaid') { setTokenId(parsed.args.shipmentTokenId.toString()); break }
        } catch {}
      }
      setStep('done')
    } catch (e: any) {
      setErrMsg(e.message?.slice(0, 100) ?? 'Transaction failed')
      setStep('idle')
    }
  }

  if (step === 'done') return (
    <div className="page fadein">
      <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'center' }}>
        <div className="th-logo"><span className="th-logo-text">TH</span></div>
      </div>
      <div style={{ padding: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
        <h2 className="font-display" style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Purchase Confirmed!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
          Your ADI is held safely in escrow. The seller has been notified.
        </p>
        {tokenId && (
          <div className="card" style={{ padding: 20, marginBottom: 20, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>📦</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>ShipmentNFT Minted!</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Token ID #{tokenId}</div>
              </div>
            </div>
            <button className="btn-primary" onClick={() => router.push(`/track/${tokenId}`)}>Track Your Package 🌍</button>
          </div>
        )}
        <button className="btn-outline" onClick={() => router.push('/')}>Back to ThreadHunt</button>
      </div>
      <BottomNav />
    </div>
  )

  const isPaying = step === 'approving' || step === 'paying'

  return (
    <div className="page fadein">
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.back()} style={{ width: 38, height: 38, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div className="th-logo" style={{ width: 44, height: 44 }}><span className="th-logo-text">TH</span></div>
        <h1 className="font-display" style={{ fontSize: 22, fontWeight: 700 }}>Order</h1>
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* Item details */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--purple)', marginBottom: 14 }}>Item Details</h3>
          <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
            <img src={product.img} alt={product.title} style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{product.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{product.seller}</div>
            </div>
          </div>
          {[['Seller', product.seller], ['Ships From', product.location]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Price breakdown */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--purple)', marginBottom: 14 }}>Price Breakdown</h3>
          {[['Item Price', `$${product.price} ${product.currency}`], ['Shipping', `$${SHIPPING_FEE} USD`], ['Platform Fee', `$${PLATFORM_FEE} USD`]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{v}</span>
            </div>
          ))}
          <div style={{ borderTop: '1.5px solid #F0EAF8', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--purple)' }}>Total</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--purple)' }}>${total} {product.currency}</div>
              {adiQuote > 0n && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{formatAdi(adiQuote)}</div>}
            </div>
          </div>
        </div>

        {/* Payment method toggle */}
        <div style={{ display: 'flex', background: 'rgba(91,63,166,0.08)', borderRadius: 14, padding: 4, marginBottom: 20, gap: 4 }}>
          {(['wallet', 'qr'] as PayMethod[]).map(m => (
            <button key={m} onClick={() => setPayMethod(m)} style={{
              flex: 1, padding: '10px 0', borderRadius: 11, border: 'none', cursor: 'pointer',
              fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 14,
              background: payMethod === m ? 'white' : 'transparent',
              color: payMethod === m ? 'var(--purple)' : 'var(--text-muted)',
              boxShadow: payMethod === m ? '0 2px 8px rgba(91,63,166,0.12)' : 'none',
              transition: 'all 0.2s',
            }}>
              {m === 'wallet' ? '🦊 Connect Wallet' : '📱 Scan QR Code'}
            </button>
          ))}
        </div>

        {/* Wallet payment */}
        {payMethod === 'wallet' && (
          <div>
            <div style={{ background: 'rgba(91,63,166,0.06)', borderRadius: 14, padding: 14, marginBottom: 16, display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🔒</span>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Your ADI is held in smart contract escrow until you confirm delivery. Full refund if package never arrives.
              </p>
            </div>
            {errMsg && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 13, color: '#DC2626' }}>{errMsg}</div>}
            {isPaying && (
              <div style={{ textAlign: 'center', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)' }} />
                <span style={{ fontSize: 14, color: 'var(--purple)', fontWeight: 500 }}>
                  {step === 'approving' ? 'Step 1/2: Approving ADI…' : 'Step 2/2: Confirming on-chain…'}
                </span>
              </div>
            )}
            {!address
              ? <button className="btn-primary" onClick={connect} disabled={connecting}>{connecting ? 'Connecting…' : '🦊 Connect Wallet to Purchase'}</button>
              : <button className="btn-primary" onClick={handlePurchase} disabled={isPaying}>{isPaying ? 'Processing…' : 'Confirm Purchase'}</button>
            }
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>Secured by ADI blockchain • Escrow protected</p>
          </div>
        )}

        {/* QR payment */}
        {payMethod === 'qr' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
              Scan with your mobile wallet to pay in ADI. No browser extension needed.
            </p>
            <div style={{ marginBottom: 20 }}>
              <QRCode value={qrValue} size={200} label={adiQuote > 0n ? `Send ${formatAdi(adiQuote)} to complete purchase` : 'Loading amount...'} />
            </div>
            <div className="card" style={{ padding: 16, marginBottom: 16, textAlign: 'left' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>CONTRACT ADDRESS</div>
              <div style={{ fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all', color: 'var(--purple)', background: 'rgba(91,63,166,0.06)', padding: '8px 12px', borderRadius: 8 }}>{CONTRACTS.ADI_INVOICE}</div>
            </div>
            {adiQuote > 0n && (
              <div className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Amount</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--purple)' }}>{formatAdi(adiQuote)}</span>
              </div>
            )}
            <div style={{ background: 'rgba(91,63,166,0.06)', borderRadius: 14, padding: 14, display: 'flex', gap: 10, textAlign: 'left' }}>
              <span style={{ fontSize: 18 }}>💡</span>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>After scanning, return here and connect your wallet to confirm and mint your tracking NFT.</p>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
