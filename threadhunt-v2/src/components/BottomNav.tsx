'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const path = usePathname()
  const active = (p: string) => path === p || path.startsWith(p + '/')

  return (
    <nav className="bottom-nav">
      <Link href="/" className={`nav-item ${path === '/' ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24" fill={path==='/'?'currentColor':'none'} stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        Home
      </Link>

      <Link href="/track" className={`nav-item ${active('/track') ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10"/>
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
        </svg>
        Track
      </Link>

      <Link href="/sell" className={`nav-item ${active('/sell') ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        Sell
      </Link>

      <Link href="/profile" className={`nav-item ${active('/profile') ? 'active' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        Profile
      </Link>
    </nav>
  )
}
