import { describe, expect, it } from 'vitest'

import { checkReadiness, type CheckReadinessInput, type PaymentIntent } from '../src/index.js'

const invoiceIntent: PaymentIntent = {
  kind: 'invoice',
  invoice: 'fiber-fixture:network=testnet;asset=CKB;amount=4200;expiresAt=2026-07-04T00:00:00.000Z'
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
        localBalance: '5000',
        remoteBalance: '5000',
        assetId: 'CKB',
        peerId: 'peer-1'
      }
    ],
    routeAvailable: true,
    targetPeerId: 'peer-1'
  }
}

describe('checkReadiness channel state diagnostics', () => {
  it('does not emit channel diagnostics when a target peer channel is ready', () => {
    const report = checkReadiness(createBaseInput())

    expect(report.diagnostics).toEqual([])
  })

  it('emits CHANNEL_NOT_READY when the target peer channel is still negotiating', () => {
    const report = checkReadiness({
      ...createBaseInput(),
      channels: [
        {
          channelId: 'channel-1',
          state: 'CHANNEL_PENDING',
          localBalance: '5000',
          remoteBalance: '5000',
          assetId: 'CKB',
          peerId: 'peer-1'
        }
      ]
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'CHANNEL_NOT_READY'
    ])
  })

  it('emits CHANNEL_CLOSED when the target peer channel is closed', () => {
    const report = checkReadiness({
      ...createBaseInput(),
      channels: [
        {
          channelId: 'channel-1',
          state: 'CHANNEL_CLOSED',
          localBalance: '0',
          remoteBalance: '0',
          assetId: 'CKB',
          peerId: 'peer-1'
        }
      ]
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'CHANNEL_CLOSED'
    ])
  })

  it('emits FORCE_CLOSE_TLC_PENDING when a force-closed channel still has pending TLCs', () => {
    const report = checkReadiness({
      ...createBaseInput(),
      channels: [
        {
          channelId: 'channel-1',
          state: 'CHANNEL_FORCE_CLOSED_PENDING_TLC',
          localBalance: '0',
          remoteBalance: '0',
          assetId: 'CKB',
          peerId: 'peer-1'
        }
      ]
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'FORCE_CLOSE_TLC_PENDING'
    ])
  })

  it('orders channel diagnostics after peer and graph preconditions', () => {
    const report = checkReadiness({
      ...createBaseInput(),
      node: {
        nodeName: 'fiber-node',
        peerId: 'self',
        network: 'testnet',
        graphSynced: false,
        blockHeight: '42'
      },
      peers: [],
      channels: [
        {
          channelId: 'channel-1',
          state: 'CHANNEL_PENDING',
          localBalance: '5000',
          remoteBalance: '5000',
          assetId: 'CKB',
          peerId: 'peer-1'
        }
      ],
      routeAvailable: false
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'PEER_NOT_CONNECTED',
      'GRAPH_NOT_SYNCED',
      'CHANNEL_NOT_READY',
      'NO_ROUTE'
    ])
  })
})
