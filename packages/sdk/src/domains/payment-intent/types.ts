import type { DiagnosticItem } from '../diagnostics/types.js'

export type FiberNetwork = 'mainnet' | 'testnet' | 'devnet'

export type InvoiceAsset =
  | {
      kind: 'CKB'
    }
  | {
      kind: 'UDT'
      assetId: string
    }

export type PaymentIntent =
  | {
      kind: 'invoice'
      invoice: string
    }
  | {
      kind: 'manual'
      amount: string
      assetId: string
      targetPubkey: string
    }

export type ParsedInvoice = {
  raw: string
  network: FiberNetwork
  asset: InvoiceAsset
  amount: string | null
  expiresAtIso: string
}

export type InvoiceAnalysisInput = {
  intent: PaymentIntent
  nowIso: string
  expectedNetwork?: FiberNetwork
}

export type InvoiceAnalysisReport = {
  intent: PaymentIntent
  invoice: ParsedInvoice | null
  diagnostics: readonly DiagnosticItem[]
}
