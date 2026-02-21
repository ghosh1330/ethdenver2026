'use client'
import { useEffect, useRef } from 'react'

interface QRCodeProps {
  value: string
  size?: number
  label?: string
}

/**
 * Lightweight QR code using the free qrserver API — no npm package needed.
 * Shows the wallet address + amount as a scannable QR for mobile wallets.
 */
export default function QRCode({ value, size = 180, label }: QRCodeProps) {
  const encoded = encodeURIComponent(value)
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=ffffff&color=44337A&margin=10`

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        display: 'inline-block',
        background: 'white',
        borderRadius: 16,
        padding: 12,
        boxShadow: '0 2px 16px rgba(91,63,166,0.15)',
        border: '1.5px solid rgba(91,63,166,0.12)',
      }}>
        <img
          src={url}
          alt="QR Code"
          width={size}
          height={size}
          style={{ display: 'block', borderRadius: 8 }}
        />
      </div>
      {label && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.5 }}>
          {label}
        </p>
      )}
    </div>
  )
}
