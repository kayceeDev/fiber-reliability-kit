import { describe, expect, it } from 'vitest'

import { checkReadiness, type CheckReadinessInput, type PaymentIntent } from '../src/index.js'

const invoiceIntent: PaymentIntent = {
  kind: 'invoice',
  invoice: 'fiber-fixture:network=testnet;asset=CKB;amount=700;expiresAt=2026-07-04T00:00:00.000Z'
}

function createBaseInput(): CheckReadinessInput {
  return {
    intent: invoiceIntent,
    node: {
      nodeName: 'fiber-node',
      peerId: 'self',
      network: 'testnet',
      graphSynced: true,
      blockHeight: '42'
    },
    peers: [
      {
        peerId: 'peer-1',
        connected: true
      }
    ],
    channels: [
      {
        channelId: 'channel-1',
        state: 'CHANNEL_READY',
        localBalance: '1000',
        remoteBalance: '900',
        assetId: 'CKB',
        peerId: 'peer-1'
      }
    ],
    routeAvailable: true,
    targetPeerId: 'peer-1',
    routeFee: '50',
    feeCap: '100',
    routeExpiryDelta: 72,
    minSafeExpiryDelta: 36
  }
}

describe('checkReadiness fee cap and expiry diagnostics', () => {
  it('does not emit fee or expiry diagnostics when the route budget is safe', () => {
    const report = checkReadiness(createBaseInput())

    expect(report.diagnostics).toEqual([])
  })

  it('emits FEE_CAP_TOO_LOW when the route fee exceeds the configured cap', () => {
    const report = checkReadiness({
      ...createBaseInput(),
      routeFee: '150',
      feeCap: '100'
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'FEE_CAP_TOO_LOW'
    ])
  })

  it('emits EXPIRY_UNSAFE when the expiry delta is below the safe threshold', () => {
    const report = checkReadiness({
      ...createBaseInput(),
      routeExpiryDelta: 12,
      minSafeExpiryDelta: 36
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'EXPIRY_UNSAFE'
    ])
  })

  it('orders fee-cap diagnostics before expiry warnings when both apply', () => {
    const report = checkReadiness({
      ...createBaseInput(),
      routeFee: '150',
      feeCap: '100',
      routeExpiryDelta: 12,
      minSafeExpiryDelta: 36
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'FEE_CAP_TOO_LOW',
      'EXPIRY_UNSAFE'
    ])
  })

  it('skips fee and expiry checks when no route is currently available', () => {
    const report = checkReadiness({
      ...createBaseInput(),
      routeAvailable: false,
      routeFee: '150',
      routeExpiryDelta: 12
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'NO_ROUTE'
    ])
  })
})
