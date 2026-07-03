import {
  type DiagnosticCode,
  type DiagnosticEvidence,
  type DiagnosticItem,
  type DiagnosticSeverity,
  type DiagnosticSource,
  type RecoveryAction
} from './types.js'

export type DiagnosticMetadata = {
  severity: DiagnosticSeverity
  source: DiagnosticSource
  summary: string
  recoveryActions: readonly RecoveryAction[]
}

export const diagnosticMetadataByCode: Record<DiagnosticCode, DiagnosticMetadata> = {
  MALFORMED_INVOICE: {
    severity: 'error',
    source: 'invoice',
    summary: 'Invoice could not be parsed or did not satisfy the expected Fiber invoice shape.',
    recoveryActions: [
      {
        label: 'Recreate invoice',
        description: 'Generate a fresh Fiber invoice and verify it was copied without truncation or mutation.'
      }
    ]
  },
  INVOICE_EXPIRED: {
    severity: 'error',
    source: 'invoice',
    summary: 'Invoice expiry has already elapsed for the attempted payment time.',
    recoveryActions: [
      {
        label: 'Request new invoice',
        description: 'Ask the receiver for a new invoice with a fresh expiry window before retrying.'
      }
    ]
  },
  INVOICE_AMOUNT_MISSING: {
    severity: 'warning',
    source: 'invoice',
    summary: 'Invoice is missing an amount, so the payer must provide one before sending.',
    recoveryActions: [
      {
        label: 'Provide amount',
        description: 'Collect the intended payment amount from the integration or operator before sending.'
      }
    ]
  },
  NETWORK_MISMATCH: {
    severity: 'error',
    source: 'invoice',
    summary: 'Invoice network does not match the active Fiber network for this payment attempt.',
    recoveryActions: [
      {
        label: 'Switch network',
        description: 'Use an invoice and node environment that target the same Fiber network.'
      }
    ]
  },
  ASSET_MISMATCH: {
    severity: 'error',
    source: 'liquidity',
    summary: 'Payment asset does not match the available channel or route asset requirements.',
    recoveryActions: [
      {
        label: 'Match asset',
        description: 'Retry with the correct asset or open liquidity for the requested asset type.'
      }
    ]
  },
  PEER_NOT_CONNECTED: {
    severity: 'error',
    source: 'peer',
    summary: 'Required Fiber peer is not currently connected.',
    recoveryActions: [
      {
        label: 'Reconnect peer',
        description: 'Restore the peer connection and confirm the remote node is reachable before retrying.'
      }
    ]
  },
  GRAPH_NOT_SYNCED: {
    severity: 'warning',
    source: 'graph',
    summary: 'Routing graph is not fully synced, so route decisions may be incomplete or stale.',
    recoveryActions: [
      {
        label: 'Wait for sync',
        description: 'Let graph synchronization finish before treating route failures as definitive.'
      }
    ]
  },
  NO_ROUTE: {
    severity: 'error',
    source: 'route',
    summary: 'No viable route was found for the current payment attempt.',
    recoveryActions: [
      {
        label: 'Re-evaluate route',
        description: 'Retry after graph sync, peer recovery, or liquidity changes create a viable path.'
      }
    ]
  },
  CHANNEL_NOT_READY: {
    severity: 'warning',
    source: 'channel',
    summary: 'Channel exists but is not yet in a ready state for forwarding or sending.',
    recoveryActions: [
      {
        label: 'Wait for readiness',
        description: 'Allow negotiation or funding flow to complete until the channel becomes operational.'
      }
    ]
  },
  CHANNEL_CLOSED: {
    severity: 'error',
    source: 'channel',
    summary: 'Required channel is closed and cannot be used for the payment attempt.',
    recoveryActions: [
      {
        label: 'Use another channel',
        description: 'Select a different route or reopen liquidity before retrying the payment.'
      }
    ]
  },
  INSUFFICIENT_OUTBOUND_LIQUIDITY: {
    severity: 'error',
    source: 'liquidity',
    summary: 'Outbound liquidity is below the amount required to send the payment.',
    recoveryActions: [
      {
        label: 'Increase outbound liquidity',
        description: 'Rebalance or fund a channel with enough local balance for the payment amount.'
      }
    ]
  },
  INSUFFICIENT_INBOUND_LIQUIDITY: {
    severity: 'error',
    source: 'liquidity',
    summary: 'Receiver-side inbound liquidity is not sufficient for the attempted payment amount.',
    recoveryActions: [
      {
        label: 'Increase inbound liquidity',
        description: 'Open or rebalance channels so the receiver can accept the incoming amount.'
      }
    ]
  },
  FEE_CAP_TOO_LOW: {
    severity: 'warning',
    source: 'route',
    summary: 'Configured fee cap is lower than the route requires.',
    recoveryActions: [
      {
        label: 'Raise fee cap',
        description: 'Increase the allowed fee budget or choose a cheaper route if one exists.'
      }
    ]
  },
  EXPIRY_UNSAFE: {
    severity: 'warning',
    source: 'route',
    summary: 'Payment expiry margin is too small for safe forwarding or completion.',
    recoveryActions: [
      {
        label: 'Use safer expiry',
        description: 'Retry with a larger expiry window that leaves enough safety margin for settlement.'
      }
    ]
  },
  PAYMENT_RETRYABLE_FAILURE: {
    severity: 'warning',
    source: 'payment',
    summary: 'Payment failed in a way that may succeed on a later attempt.',
    recoveryActions: [
      {
        label: 'Retry payment',
        description: 'Retry after transient peer, route, or liquidity conditions have changed.'
      }
    ]
  },
  PAYMENT_TERMINAL_FAILURE: {
    severity: 'error',
    source: 'payment',
    summary: 'Payment failed with a terminal condition that requires changing the input or state first.',
    recoveryActions: [
      {
        label: 'Correct root cause',
        description: 'Resolve the underlying terminal problem before sending another attempt.'
      }
    ]
  },
  PAYMENT_STUCK_INFLIGHT: {
    severity: 'critical',
    source: 'payment',
    summary: 'Payment remains inflight beyond the expected recovery window.',
    recoveryActions: [
      {
        label: 'Inspect inflight state',
        description: 'Investigate payment attempts, channel state, and timeout boundaries before retrying.'
      }
    ]
  },
  CCH_ORDER_STUCK: {
    severity: 'critical',
    source: 'cch',
    summary: 'Cross-chain order is stuck in a state that requires operator attention.',
    recoveryActions: [
      {
        label: 'Inspect CCH order',
        description: 'Review the CCH order lifecycle and recovery path before taking the next action.'
      }
    ]
  },
  CCH_EXPIRY_UNSAFE: {
    severity: 'warning',
    source: 'cch',
    summary: 'Cross-chain expiry window is too tight for safe completion.',
    recoveryActions: [
      {
        label: 'Increase CCH expiry margin',
        description: 'Retry or recreate the order with a safer expiry dependency window.'
      }
    ]
  },
  CCH_FEE_BUDGET_UNSAFE: {
    severity: 'warning',
    source: 'cch',
    summary: 'Cross-chain fee budget is too low for a safe or realistic completion path.',
    recoveryActions: [
      {
        label: 'Raise CCH fee budget',
        description: 'Increase the fee budget or wait for conditions where the budget becomes sufficient.'
      }
    ]
  },
  FORCE_CLOSE_TLC_PENDING: {
    severity: 'critical',
    source: 'channel',
    summary: 'A force-closed TLC still has pending settlement work that can block clean recovery.',
    recoveryActions: [
      {
        label: 'Monitor TLC settlement',
        description: 'Track pending TLC resolution and avoid assuming channel funds are available until settlement completes.'
      }
    ]
  }
}

export type CreateDiagnosticOptions = {
  evidence?: readonly DiagnosticEvidence[]
  recoveryActions?: readonly RecoveryAction[]
  summary?: string
}

export function createDiagnostic(
  code: DiagnosticCode,
  options: CreateDiagnosticOptions = {}
): DiagnosticItem {
  const metadata = diagnosticMetadataByCode[code]

  return {
    code,
    severity: metadata.severity,
    source: metadata.source,
    summary: options.summary ?? metadata.summary,
    evidence: options.evidence ?? [],
    recoveryActions: options.recoveryActions ?? metadata.recoveryActions
  }
}
