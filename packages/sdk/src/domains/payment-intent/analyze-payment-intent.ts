import { createDiagnostic as createTaxonomyDiagnostic } from '../diagnostics/taxonomy.js'
import type { DiagnosticItem } from '../diagnostics/types.js'
import type {
  InvoiceAsset,
  InvoiceAnalysisInput,
  InvoiceAnalysisReport,
  ParsedInvoice,
  PaymentIntent
} from './types.js'

function createDiagnostic(code: DiagnosticItem['code'], summary: string): DiagnosticItem {
  return createTaxonomyDiagnostic(code, {
    summary
  })
}

function parseInvoiceAsset(rawAsset: string): InvoiceAsset | null {
  if (rawAsset === 'CKB') {
    return {
      kind: 'CKB'
    }
  }

  if (rawAsset.startsWith('UDT:')) {
    const assetId = rawAsset.slice('UDT:'.length)

    if (!assetId) {
      return null
    }

    return {
      kind: 'UDT',
      assetId
    }
  }

  return null
}

function parseFixtureInvoice(invoice: string): ParsedInvoice | null {
  if (!invoice.startsWith('fiber-fixture:')) {
    return null
  }

  const rawFields = invoice.slice('fiber-fixture:'.length).split(';')
  const fieldMap = new Map<string, string>()

  for (const rawField of rawFields) {
    const [key, value] = rawField.split('=')

    if (!key || value === undefined || value.length === 0) {
      return null
    }

    fieldMap.set(key, value)
  }

  const network = fieldMap.get('network')
  const rawAsset = fieldMap.get('asset')
  const expiresAtIso = fieldMap.get('expiresAt')

  if (!network || !rawAsset || !expiresAtIso) {
    return null
  }

  if (network !== 'mainnet' && network !== 'testnet' && network !== 'devnet') {
    return null
  }

  const asset = parseInvoiceAsset(rawAsset)

  if (!asset) {
    return null
  }

  const expiresAtMs = Date.parse(expiresAtIso)

  if (Number.isNaN(expiresAtMs)) {
    return null
  }

  const amount = fieldMap.get('amount') ?? null

  return {
    raw: invoice,
    network,
    asset,
    amount,
    expiresAtIso
  }
}

function analyzeParsedInvoice(
  input: InvoiceAnalysisInput,
  intent: Extract<PaymentIntent, { kind: 'invoice' }>,
  invoice: ParsedInvoice | null
): InvoiceAnalysisReport {
  if (!invoice) {
    return {
      intent,
      invoice: null,
      diagnostics: [
        createDiagnostic(
          'MALFORMED_INVOICE',
          'Invoice could not be parsed by the current invoice analysis boundary.'
        )
      ]
    }
  }

  const diagnostics: DiagnosticItem[] = []

  if (invoice.amount === null) {
    diagnostics.push(
      createDiagnostic(
        'INVOICE_AMOUNT_MISSING',
        'Invoice does not include an amount, so the payer must provide one before sending.'
      )
    )
  }

  const nowMs = Date.parse(input.nowIso)
  const expiresAtMs = Date.parse(invoice.expiresAtIso)

  if (expiresAtMs < nowMs) {
    diagnostics.push(
      createDiagnostic(
        'INVOICE_EXPIRED',
        'Invoice expiry is in the past relative to the provided analysis clock.'
      )
    )
  }

  if (input.expectedNetwork && invoice.network !== input.expectedNetwork) {
    diagnostics.push(
      createDiagnostic(
        'NETWORK_MISMATCH',
        'Invoice network does not match the expected Fiber network for this payment attempt.'
      )
    )
  }

  return {
    intent,
    invoice,
    diagnostics
  }
}

export function parseInvoiceFromRpcResult(
  rawInvoice: string,
  rpcResult: {
    invoice?: {
      currency?: string
      amount?: string | null
      data?: {
        attrs?: {
          expiry_time?: string
          udt_script?: string
        }
      }
    }
  }
): ParsedInvoice | null {
  const invoice = rpcResult.invoice

  if (!invoice?.currency || !invoice.data?.attrs?.expiry_time) {
    return null
  }

  const network =
    invoice.currency === 'Fibb'
      ? 'mainnet'
      : invoice.currency === 'Fibt'
        ? 'testnet'
        : invoice.currency === 'Fibd'
          ? 'devnet'
          : null

  if (!network) {
    return null
  }

  const asset = invoice.data.attrs.udt_script
    ? {
        kind: 'UDT' as const,
        assetId: invoice.data.attrs.udt_script
      }
    : {
        kind: 'CKB' as const
      }

  return {
    raw: rawInvoice,
    network,
    asset,
    amount: invoice.amount ?? null,
    expiresAtIso: invoice.data.attrs.expiry_time
  }
}

function analyzeInvoiceIntent(input: InvoiceAnalysisInput, intent: Extract<PaymentIntent, { kind: 'invoice' }>): InvoiceAnalysisReport {
  return analyzeParsedInvoice(input, intent, parseFixtureInvoice(intent.invoice))
}

export function analyzePaymentIntent(input: InvoiceAnalysisInput): InvoiceAnalysisReport {
  if (input.intent.kind === 'manual') {
    return {
      intent: input.intent,
      invoice: null,
      diagnostics: []
    }
  }

  return analyzeInvoiceIntent(input, input.intent)
}
