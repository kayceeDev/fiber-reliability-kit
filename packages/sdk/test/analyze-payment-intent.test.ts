import { describe, expect, it } from 'vitest'

import { analyzePaymentIntent, type PaymentIntent } from '../src/index.js'

describe('analyzePaymentIntent', () => {
  it('classifies unsupported invoice strings as malformed invoices', () => {
    const paymentIntent: PaymentIntent = {
      kind: 'invoice',
      invoice: 'not-a-fiber-invoice'
    }

    const report = analyzePaymentIntent({
      intent: paymentIntent,
      nowIso: '2026-07-03T00:00:00.000Z'
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'MALFORMED_INVOICE'
    ])
    expect(report.invoice).toBeNull()
  })

  it('classifies invoices without an amount as missing amount invoices', () => {
    const report = analyzePaymentIntent({
      intent: {
        kind: 'invoice',
        invoice:
          'fiber-fixture:network=testnet;asset=CKB;expiresAt=2026-07-04T00:00:00.000Z'
      },
      nowIso: '2026-07-03T00:00:00.000Z'
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'INVOICE_AMOUNT_MISSING'
    ])
    expect(report.invoice?.network).toBe('testnet')
    expect(report.invoice?.asset.kind).toBe('CKB')
    expect(report.invoice?.amount).toBeNull()
  })

  it('classifies expired invoices using the provided clock', () => {
    const report = analyzePaymentIntent({
      intent: {
        kind: 'invoice',
        invoice:
          'fiber-fixture:network=testnet;asset=CKB;amount=4200;expiresAt=2026-07-02T23:59:59.000Z'
      },
      nowIso: '2026-07-03T00:00:00.000Z'
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'INVOICE_EXPIRED'
    ])
    expect(report.invoice?.expiresAtIso).toBe('2026-07-02T23:59:59.000Z')
  })

  it('classifies invoice network mismatches against the expected network', () => {
    const report = analyzePaymentIntent({
      intent: {
        kind: 'invoice',
        invoice:
          'fiber-fixture:network=mainnet;asset=CKB;amount=4200;expiresAt=2026-07-04T00:00:00.000Z'
      },
      expectedNetwork: 'testnet',
      nowIso: '2026-07-03T00:00:00.000Z'
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'NETWORK_MISMATCH'
    ])
    expect(report.invoice?.network).toBe('mainnet')
  })

  it('detects both CKB and UDT invoice assets', () => {
    const ckbReport = analyzePaymentIntent({
      intent: {
        kind: 'invoice',
        invoice:
          'fiber-fixture:network=testnet;asset=CKB;amount=4200;expiresAt=2026-07-04T00:00:00.000Z'
      },
      nowIso: '2026-07-03T00:00:00.000Z'
    })

    const udtReport = analyzePaymentIntent({
      intent: {
        kind: 'invoice',
        invoice:
          'fiber-fixture:network=testnet;asset=UDT:0xudt-asset;amount=4200;expiresAt=2026-07-04T00:00:00.000Z'
      },
      nowIso: '2026-07-03T00:00:00.000Z'
    })

    expect(ckbReport.invoice?.asset).toEqual({
      kind: 'CKB'
    })
    expect(udtReport.invoice?.asset).toEqual({
      kind: 'UDT',
      assetId: '0xudt-asset'
    })
    expect(udtReport.diagnostics).toEqual([])
  })
})
