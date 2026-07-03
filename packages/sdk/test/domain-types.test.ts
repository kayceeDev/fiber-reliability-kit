import { describe, expect, it } from 'vitest'

import {
  diagnosticCodes,
  diagnosticSeverities,
  diagnosticSources,
  sdkPackageName,
  type DiagnosticCode,
  type DiagnosticItem,
  type DiagnosticSeverity,
  type PaymentIntent,
  type ReadinessReport,
  type RecoveryAction,
  type ReliabilityFixture
} from '../src/index.js'

describe('sdk domain types', () => {
  it('exports the workspace package name', () => {
    expect(sdkPackageName).toBe('@fiber-reliability/sdk')
  })

  it('exports diagnostic severity values', () => {
    expect(diagnosticSeverities).toEqual([
      'informational',
      'warning',
      'error',
      'critical'
    ])
  })

  it('exports diagnostic source values', () => {
    expect(diagnosticSources).toEqual([
      'invoice',
      'route',
      'liquidity',
      'channel',
      'graph',
      'peer',
      'payment',
      'cch',
      'node'
    ])
  })

  it('includes the initial diagnostic taxonomy', () => {
    expect(diagnosticCodes).toEqual([
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
    ])
  })

  it('supports the initial report shapes', () => {
    const recoveryAction: RecoveryAction = {
      label: 'Reconnect the target peer',
      description: 'Open or restore the Fiber peer connection before retrying.'
    }

    const paymentIntent: PaymentIntent = {
      kind: 'invoice',
      invoice: 'fibtest1example'
    }

    const diagnosticItem: DiagnosticItem = {
      code: 'PEER_NOT_CONNECTED',
      severity: 'error',
      source: 'peer',
      summary: 'Target peer is not connected.',
      evidence: [
        {
          label: 'peerConnected',
          value: false
        }
      ],
      recoveryActions: [recoveryAction]
    }

    const readinessReport: ReadinessReport = {
      intent: paymentIntent,
      diagnostics: [diagnosticItem]
    }

    const fixture: ReliabilityFixture = {
      schemaVersion: 1,
      id: 'peer-missing',
      title: 'Missing peer connection',
      description: 'The payer is disconnected from the target peer.',
      input: {
        intent: paymentIntent
      },
      expected: {
        diagnostics: ['PEER_NOT_CONNECTED']
      }
    }

    expect(readinessReport.diagnostics[0]?.code).toBe('PEER_NOT_CONNECTED')
    expect(fixture.expected.diagnostics).toContain('PEER_NOT_CONNECTED')
  })

  it('keeps exported arrays aligned with the literal union types', () => {
    const severity: DiagnosticSeverity = diagnosticSeverities[0]
    const code: DiagnosticCode = diagnosticCodes[0]

    expect(severity).toBe('informational')
    expect(code).toBe('MALFORMED_INVOICE')
  })
})
