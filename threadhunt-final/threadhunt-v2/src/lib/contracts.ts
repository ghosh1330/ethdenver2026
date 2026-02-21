export const CONTRACTS = {
  ADI_TOKEN:      process.env.NEXT_PUBLIC_ADI_TOKEN_ADDRESS      ?? '',
  ORACLE_ADAPTER: process.env.NEXT_PUBLIC_ORACLE_ADAPTER_ADDRESS ?? '',
  ADI_INVOICE:    process.env.NEXT_PUBLIC_ADI_INVOICE_ADDRESS    ?? '',
  SHIPMENT_NFT:   process.env.NEXT_PUBLIC_SHIPMENT_NFT_ADDRESS   ?? '',
}

export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? '31337')
export const RPC_URL  = process.env.NEXT_PUBLIC_RPC_URL ?? 'http://127.0.0.1:8545'

export const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
]

export const ORACLE_ABI = [
  'function getQuote(uint256 fiatAmountMinor, bytes32 currency) view returns (uint256)',
  'function getRate(bytes32 currency) view returns (uint256)',
]

export const INVOICE_ABI = [
  'function createInvoice(address merchant, uint256 fiatAmountMinor, bytes32 currency, uint64 expiresAt) returns (uint256)',
  'function payInvoice(uint256 invoiceId, string itemName, string origin, string destination)',
  'function confirmDelivery(uint256 invoiceId)',
  'function claimRefund(uint256 invoiceId)',
  'function quoteInvoice(uint256 invoiceId) view returns (uint256 adiAmount, uint256 rate)',
  'function getInvoice(uint256 invoiceId) view returns (tuple(address merchant, address payer, uint256 fiatAmountMinor, bytes32 currency, uint64 expiresAt, uint256 adiAmount, uint256 rateUsed, uint256 paidAt, uint256 shipmentTokenId, uint8 status))',
  'function getMerchantInvoices(address merchant) view returns (uint256[])',
  'function getBuyerInvoices(address buyer) view returns (uint256[])',
  'function canRefund(uint256 invoiceId) view returns (bool)',
  'event InvoicePaid(uint256 indexed invoiceId, address indexed merchant, address indexed payer, uint256 fiatAmount, bytes32 currency, uint256 adiAmount, uint256 rateUsed, uint256 shipmentTokenId)',
]

export const SHIPMENT_NFT_ABI = [
  'function getShipment(uint256 tokenId) view returns (tuple(uint256 invoiceId, address seller, address buyer, string itemName, string origin, string destination, uint8 status, uint256 mintedAt, uint256 deliveredAt))',
  'function getTokenByInvoice(uint256 invoiceId) view returns (uint256)',
  'function statusLabel(uint256 tokenId) view returns (string)',
  'function updateStatus(uint256 tokenId, uint8 newStatus)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'event StatusUpdated(uint256 indexed tokenId, uint8 oldStatus, uint8 newStatus, address updatedBy)',
]

export const STATUS_LABELS = ['Packed', 'Shipped', 'In Transit', 'Delivered']
export const STATUS_ICONS  = ['📦', '🚚', '✈️', '✅']

export const CURRENCY_LABELS: Record<string, { symbol: string; flag: string }> = {
  USD: { symbol: '$',    flag: '🇺🇸' },
  AED: { symbol: 'د.إ', flag: '🇦🇪' },
}

export function formatFiat(minor: bigint, currency: string): string {
  const c = CURRENCY_LABELS[currency] ?? { symbol: currency, flag: '🌍' }
  return `${c.symbol}${(Number(minor) / 100).toFixed(2)}`
}

export function formatAdi(wei: bigint): string {
  const val = Number(wei) / 1e18
  if (val < 0.001) return val.toExponential(3) + ' ADI'
  return val.toLocaleString(undefined, { maximumFractionDigits: 4 }) + ' ADI'
}

export function decodeCurrency(bytes32: string): string {
  const hex = bytes32.startsWith('0x') ? bytes32.slice(2) : bytes32
  let str = ''
  for (let i = 0; i < hex.length; i += 2) {
    const code = parseInt(hex.slice(i, i + 2), 16)
    if (code === 0) break
    str += String.fromCharCode(code)
  }
  return str
}
