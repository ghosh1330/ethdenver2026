'use client'
import { useState, useEffect, useCallback } from 'react'
import { Contract } from 'ethers'
import { useWallet } from '@/lib/wallet'
import { CONTRACTS, INVOICE_ABI, ORACLE_ABI, ERC20_ABI, formatFiat, formatAdi, decodeCurrency, CURRENCY_LABELS, RPC_URL } from '@/lib/contracts'

interface InvoiceData {
  merchant: string
  fiatAmountMinor: bigint
  currency: string
  status: number
  adiAmount: bigint
  rate: bigint
}

type Step = 'loading' | 'ready' | 'approving' | 'paying' | 'success' | 'error'

export default function AdiCheckout({ invoiceId }: { invoiceId: string }) {
  const { address, signer, connect, connecting } = useWallet()
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [step, setStep]       = useState<Step>('loading')
  const [txHash, setTxHash]   = useState('')
  const [errMsg, setErrMsg]   = useState('')

  const loadInvoice = useCallback(async () => {
    setStep('loading')
    try {
      const { JsonRpcProvider } = await import('ethers')
      const provider = new JsonRpcProvider(RPC_URL)
      const contract = new Contract(CONTRACTS.ADI_INVOICE, INVOICE_ABI, provider)
      const inv = await contract.getInvoice(BigInt(invoiceId))
      const currency = decodeCurrency(inv.currency)
      const [adiAmount, rate] = await contract.quoteInvoice(BigInt(invoiceId))
      setInvoice({ merchant: inv.merchant, fiatAmountMinor: inv.fiatAmountMinor, currency, status: Number(inv.status), adiAmount, rate })
      setStep(inv.status === 0 ? 'ready' : 'success')
    } catch (e: any) {
      setErrMsg(e.message ?? 'Failed to load invoice')
      setStep('error')
    }
  }, [invoiceId])

  useEffect(() => { loadInvoice() }, [loadInvoice])

  const handlePay = async () => {
    if (!signer || !invoice) return
    setErrMsg('')
    try {
      setStep('approving')
      const token = new Contract(CONTRACTS.ADI_TOKEN, ERC20_ABI, signer)
      await (await token.approve(CONTRACTS.ADI_INVOICE, invoice.adiAmount)).wait()
      setStep('paying')
      const inv = new Contract(CONTRACTS.ADI_INVOICE, INVOICE_ABI, signer)
      const tx = await inv.payInvoice(BigInt(invoiceId))
      const receipt = await tx.wait()
      setTxHash(receipt.hash)
      setStep('success')
    } catch (e: any) {
      setErrMsg(e.message?.slice(0, 120) ?? 'Transaction failed')
      setStep('ready')
    }
  }

  if (step === 'success') return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
      <h2 className="font-display" style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Payment Complete!</h2>
      <p style={{ color: '#666', marginBottom: 24 }}>Your purchase is confirmed on-chain. No borders, no delays.</p>
      {txHash && <div style={{ background: '#F9F5FF', borderRadius: 12, padding: 16, marginBottom: 24, wordBreak: 'break-all', fontSize: 12, color: '#6B46C1' }}><div style={{ fontWeight: 700, marginBottom: 4 }}>Transaction Hash</div>{txHash}</div>}
      <a href="/"><button className="btn-purple">Back to ThreadHunt</button></a>
    </div>
  )

  if (step === 'error') return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
      <p style={{ color: '#DC2626', marginBottom: 16 }}>{errMsg}</p>
      <button className="btn-outline" onClick={loadInvoice}>Try Again</button>
    </div>
  )

  if (step === 'loading' || !invoice) return (
    <div style={{ padding: 24 }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56, marginBottom: 12 }} />)}
    </div>
  )

  const isPaying = step === 'approving' || step === 'paying'
  const currencyInfo = CURRENCY_LABELS[invoice.currency] ?? { flag: '🌍', symbol: invoice.currency }

  return (
    <div style={{ padding: 24 }}>
      <h2 className="font-display" style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Order Summary</h2>

      <div style={{ background: 'linear-gradient(135deg, #6B46C1, #9F7AEA)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, color: 'white' }}>
        <span style={{ fontSize: 22 }} className="float">🌍</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Global Payment</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Your location doesn't matter — pay in $ADI from anywhere</div>
        </div>
      </div>

      <div style={{ background: '#F9F9F9', borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontWeight: 600 }}>Title</span>
          <span style={{ fontWeight: 700 }}>{currencyInfo.flag} {formatFiat(invoice.fiatAmountMinor, invoice.currency)} {invoice.currency}</span>
        </div>
        <div style={{ height: 1, background: '#EEE', marginBottom: 16 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ background: '#6B46C1', color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>ADI ▾</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#6B46C1' }}>{formatAdi(invoice.adiAmount)}</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: '#AAA', textAlign: 'right' }}>Rate fetched live from on-chain oracle</div>
      </div>

      {errMsg && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: '#DC2626' }}>{errMsg}</div>}

      {!address ? (
        <div>
          <button className="btn-purple" onClick={connect} disabled={connecting}>{connecting ? 'Connecting…' : '🦊 Connect MetaMask to Pay'}</button>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#AAA', marginTop: 12 }}>No bank account needed. Just a crypto wallet.</p>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 12, padding: '8px 12px', background: '#F9F5FF', borderRadius: 8, wordBreak: 'break-all' }}>
            Paying as: {address.slice(0,6)}…{address.slice(-4)}
          </div>
          {(step === 'approving' || step === 'paying') && (
            <div style={{ textAlign: 'center', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#6B46C1' }} />
              <span style={{ fontSize: 14, color: '#6B46C1' }}>{step === 'approving' ? 'Step 1/2: Approving…' : 'Step 2/2: Sending payment…'}</span>
            </div>
          )}
          <button className="btn-purple" onClick={handlePay} disabled={isPaying}>{isPaying ? 'In Progress…' : 'Confirm Payment'}</button>
        </div>
      )}
    </div>
  )
}
