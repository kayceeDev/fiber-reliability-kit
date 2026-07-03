export const diagnosticSeverities = [
  'informational',
  'warning',
  'error',
  'critical'
] as const

export type DiagnosticSeverity = (typeof diagnosticSeverities)[number]

export const diagnosticSources = [
  'invoice',
  'route',
  'liquidity',
  'channel',
  'graph',
  'peer',
  'payment',
  'cch',
  'node'
] as const

export type DiagnosticSource = (typeof diagnosticSources)[number]

export const diagnosticCodes = [
  'MALFORMED_INVOICE',
  'INVOICE_EXPIRED',
  'INVOICE_AMOUNT_MISSING',
  'NETWORK_MISMATCH',
  'ASSET_MISMATCH',
  'PEER_NOT_CONNECTED',
  'GRAPH_NOT_SYNCED',
  'NO_ROUTE',
  'CHANNEL_NOT_READY',
  'CHANNEL_CLOSED',
  'INSUFFICIENT_OUTBOUND_LIQUIDITY',
  'INSUFFICIENT_INBOUND_LIQUIDITY',
  'FEE_CAP_TOO_LOW',
  'EXPIRY_UNSAFE',
  'PAYMENT_RETRYABLE_FAILURE',
  'PAYMENT_TERMINAL_FAILURE',
  'PAYMENT_STUCK_INFLIGHT',
  'CCH_ORDER_STUCK',
  'CCH_EXPIRY_UNSAFE',
  'CCH_FEE_BUDGET_UNSAFE',
  'FORCE_CLOSE_TLC_PENDING'
] as const

export type DiagnosticCode = (typeof diagnosticCodes)[number]

export type RecoveryAction = {
  label: string
  description: string
}

export type DiagnosticEvidence = {
  label: string
  value: boolean | number | string | null
}

export type DiagnosticItem = {
  code: DiagnosticCode
  severity: DiagnosticSeverity
  source: DiagnosticSource
  summary: string
  evidence: readonly DiagnosticEvidence[]
  recoveryActions: readonly RecoveryAction[]
}
