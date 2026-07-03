import { describe, expect, it } from 'vitest'

import { checkReadiness, type PaymentIntent } from '../src/index.js'

describe('checkReadiness', () => {
  const invoiceIntent: PaymentIntent = {
    kind: 'invoice',
    invoice: 'fiber-fixture:network=testnet;asset=CKB;amount=4200;expiresAt=2026-07-04T00:00:00.000Z'
  }

  it('returns no diagnostics when graph is synced, peer is connected, and a route is available', () => {
    const report = checkReadiness({
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
      channels: [],
      routeAvailable: true,
      targetPeerId: 'peer-1'
    })

    expect(report.diagnostics).toEqual([])
  })

  it('emits PEER_NOT_CONNECTED when the target peer is missing or disconnected', () => {
    const report = checkReadiness({
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
          peerId: 'peer-2',
          connected: true
        }
      ],
      channels: [],
      routeAvailable: true,
      targetPeerId: 'peer-1'
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'PEER_NOT_CONNECTED'
    ])
  })

  it('emits GRAPH_NOT_SYNCED when the routing graph is stale', () => {
    const report = checkReadiness({
      intent: invoiceIntent,
      node: {
        nodeName: 'fiber-node',
        peerId: 'self',
        network: 'testnet',
        graphSynced: false,
        blockHeight: '42'
      },
      peers: [
        {
          peerId: 'peer-1',
          connected: true
        }
      ],
      channels: [],
      routeAvailable: true,
      targetPeerId: 'peer-1'
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'GRAPH_NOT_SYNCED'
    ])
  })

  it('emits NO_ROUTE when the graph is synced and no route is available', () => {
    const report = checkReadiness({
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
      channels: [],
      routeAvailable: false,
      targetPeerId: 'peer-1'
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'NO_ROUTE'
    ])
  })

  it('keeps diagnostics ordered from peer and graph preconditions to route failure', () => {
    const report = checkReadiness({
      intent: invoiceIntent,
      node: {
        nodeName: 'fiber-node',
        peerId: 'self',
        network: 'testnet',
        graphSynced: false,
        blockHeight: '42'
      },
      peers: [],
      channels: [],
      routeAvailable: false,
      targetPeerId: 'peer-1'
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'PEER_NOT_CONNECTED',
      'GRAPH_NOT_SYNCED',
      'NO_ROUTE'
    ])
  })
})
