'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { CHAIN_ID } from './contracts'

interface WalletCtx {
  address: string | null
  signer: JsonRpcSigner | null
  connect: () => Promise<void>
  disconnect: () => void
  connecting: boolean
  error: string | null
}

const WalletContext = createContext<WalletCtx>({
  address: null, signer: null,
  connect: async () => {}, disconnect: () => {},
  connecting: false, error: null,
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address,    setAddress]    = useState<string | null>(null)
  const [signer,     setSigner]     = useState<JsonRpcSigner | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const connect = useCallback(async () => {
  setConnecting(true)
  setError(null)
  try {
    const eth = (window as any).ethereum
    if (!eth) throw new Error('MetaMask not found. Please install it.')
    await eth.request({ method: 'eth_requestAccounts' })
    const provider = new BrowserProvider(eth)
    
    // ✅ ADD CHAIN CHECK
    const network = await provider.getNetwork()
    if (Number(network.chainId) !== CHAIN_ID) {
      throw new Error(`Wrong network. Switch to chain ${CHAIN_ID} (0x${CHAIN_ID.toString(16)})`)
    }
    
    const s = await provider.getSigner()
    const addr = await s.getAddress()
    setAddress(addr)
    setSigner(s)
  } catch (e: any) {
    setError(e.message ?? 'Connection failed')
  } finally {
    setConnecting(false)
  }
}, [])


  const disconnect = useCallback(() => {
    setAddress(null)
    setSigner(null)
  }, [])

  return (
    <WalletContext.Provider value={{ address, signer, connect, disconnect, connecting, error }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)