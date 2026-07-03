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
    targetPeerId: 'peer-1'
  }
}

describe('checkReadiness liquidity diagnostics', () => {
  it('does not emit liquidity diagnostics when balances and asset match the invoice', () => {
    const report = checkReadiness(createBaseInput())

    expect(report.diagnostics).toEqual([])
  })

  it('emits ASSET_MISMATCH when the target channel asset does not match the invoice asset', () => {
    const report = checkReadiness({
      ...createBaseInput(),
      channels: [
        {
          channelId: 'channel-1',
          state: 'CHANNEL_READY',
          localBalance: '1000',
          remoteBalance: '900',
          assetId: '0xudt-asset',
          peerId: 'peer-1'
        }
      ]
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'ASSET_MISMATCH'
    ])
  })

  it('emits INSUFFICIENT_OUTBOUND_LIQUIDITY when local balance is below the invoice amount', () => {
    const report = checkReadiness({
      ...createBaseInput(),
      channels: [
        {
          channelId: 'channel-1',
          state: 'CHANNEL_READY',
          localBalance: '600',
          remoteBalance: '900',
          assetId: 'CKB',
          peerId: 'peer-1'
        }
      ]
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'INSUFFICIENT_OUTBOUND_LIQUIDITY'
    ])
  })

  it('emits INSUFFICIENT_INBOUND_LIQUIDITY when remote balance is below the invoice amount', () => {
    const report = checkReadiness({
      ...createBaseInput(),
      channels: [
        {
          channelId: 'channel-1',
          state: 'CHANNEL_READY',
          localBalance: '1000',
          remoteBalance: '600',
          assetId: 'CKB',
          peerId: 'peer-1'
        }
      ]
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'INSUFFICIENT_INBOUND_LIQUIDITY'
    ])
  })

  it('orders asset mismatch before liquidity insufficiency when both apply', () => {
    const report = checkReadiness({
      ...createBaseInput(),
      channels: [
        {
          channelId: 'channel-1',
          state: 'CHANNEL_READY',
          localBalance: '100',
          remoteBalance: '100',
          assetId: '0xudt-asset',
          peerId: 'peer-1'
        }
      ]
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'ASSET_MISMATCH',
      'INSUFFICIENT_OUTBOUND_LIQUIDITY',
      'INSUFFICIENT_INBOUND_LIQUIDITY'
    ])
  })
})
