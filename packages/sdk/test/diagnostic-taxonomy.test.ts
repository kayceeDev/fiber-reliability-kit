import { describe, expect, it } from 'vitest'

import {
  createDiagnostic,
  diagnosticCodes,
  diagnosticMetadataByCode,
  type DiagnosticCode
} from '../src/index.js'

describe('diagnostic taxonomy registry', () => {
  it('covers every diagnostic code with metadata', () => {
    expect(Object.keys(diagnosticMetadataByCode).sort()).toEqual([...diagnosticCodes].sort())
  })

  it('provides stable metadata for key invoice diagnostics', () => {
    expect(diagnosticMetadataByCode.MALFORMED_INVOICE).toMatchObject({
      severity: 'error',
      source: 'invoice'
    })
    expect(diagnosticMetadataByCode.INVOICE_AMOUNT_MISSING.summary).toContain('amount')
    expect(diagnosticMetadataByCode.NETWORK_MISMATCH.summary).toContain('network')
  })

  it('provides recovery actions for operator-facing channel and peer diagnostics', () => {
    expect(diagnosticMetadataByCode.PEER_NOT_CONNECTED.recoveryActions.length).toBeGreaterThan(0)
    expect(diagnosticMetadataByCode.CHANNEL_NOT_READY.recoveryActions.length).toBeGreaterThan(0)
    expect(diagnosticMetadataByCode.FORCE_CLOSE_TLC_PENDING.recoveryActions.length).toBeGreaterThan(0)
  })

  it('creates diagnostic items from taxonomy defaults with optional evidence overrides', () => {
    const diagnostic = createDiagnostic('PEER_NOT_CONNECTED', {
      evidence: [
        {
          label: 'peerConnected',
          value: false
        }
      ]
    })

    expect(diagnostic).toMatchObject({
      code: 'PEER_NOT_CONNECTED',
      severity: diagnosticMetadataByCode.PEER_NOT_CONNECTED.severity,
      source: diagnosticMetadataByCode.PEER_NOT_CONNECTED.source,
      summary: diagnosticMetadataByCode.PEER_NOT_CONNECTED.summary
    })
    expect(diagnostic.evidence).toEqual([
      {
        label: 'peerConnected',
        value: false
      }
    ])
  })

  it('allows summary overrides without changing the diagnostic code contract', () => {
    const code: DiagnosticCode = 'INVOICE_EXPIRED'
    const diagnostic = createDiagnostic(code, {
      summary: 'Invoice expired before the payment attempt reached the node.'
    })

    expect(diagnostic.code).toBe('INVOICE_EXPIRED')
    expect(diagnostic.summary).toBe('Invoice expired before the payment attempt reached the node.')
    expect(diagnostic.severity).toBe(diagnosticMetadataByCode.INVOICE_EXPIRED.severity)
  })
})
