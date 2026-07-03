import { describe, expect, it, vi } from 'vitest'

import {
  createFiberRpcClient,
  normalizeFiberChannels,
  normalizeFiberNodeInfo,
  normalizeFiberPeers,
  type FiberRpcTransport
} from '../../src/index.js'

describe('Fiber RPC client abstraction', () => {
  it('sends JSON-RPC requests through the configured transport', async () => {
    const send = vi.fn<FiberRpcTransport['send']>().mockResolvedValue({
      node_name: 'fiber-node',
      peer_id: 'peer-1',
      network: 'testnet',
      synced_to_graph: true,
      block_height: '42'
    })

    const client = createFiberRpcClient({
      send
    })

    const nodeInfo = await client.getNodeInfo()

    expect(send).toHaveBeenCalledWith('node_info', undefined)
    expect(nodeInfo.network).toBe('testnet')
    expect(nodeInfo.blockHeight).toBe('42')
  })

  it('requests peer and channel data through the same transport', async () => {
    const send = vi.fn<FiberRpcTransport['send']>()
      .mockResolvedValueOnce([
        {
          peer_id: 'peer-1',
          connected: true
        }
      ])
      .mockResolvedValueOnce([
        {
          channel_id: 'channel-1',
          state: 'CHANNEL_READY',
          local_balance: '1000',
          remote_balance: '500',
          asset_id: 'CKB',
          peer_id: 'peer-1'
        }
      ])

    const client = createFiberRpcClient({
      send
    })

    const peers = await client.listPeers()
    const channels = await client.listChannels()

    expect(peers[0]?.peerId).toBe('peer-1')
    expect(channels[0]?.state).toBe('CHANNEL_READY')
    expect(send).toHaveBeenNthCalledWith(1, 'list_peers', undefined)
    expect(send).toHaveBeenNthCalledWith(2, 'list_channels', undefined)
  })
})

describe('Fiber RPC normalizers', () => {
  it('normalizes node info responses into the SDK shape', () => {
    const normalized = normalizeFiberNodeInfo({
      node_name: 'fiber-node',
      peer_id: 'peer-1',
      network: 'testnet',
      synced_to_graph: true,
      block_height: '42'
    })

    expect(normalized).toEqual({
      nodeName: 'fiber-node',
      peerId: 'peer-1',
      network: 'testnet',
      graphSynced: true,
      blockHeight: '42'
    })
  })

  it('normalizes peer responses into stable peer objects', () => {
    const normalized = normalizeFiberPeers([
      {
        peer_id: 'peer-1',
        connected: true
      },
      {
        peer_id: 'peer-2',
        connected: false
      }
    ])

    expect(normalized).toEqual([
      {
        peerId: 'peer-1',
        connected: true
      },
      {
        peerId: 'peer-2',
        connected: false
      }
    ])
  })

  it('normalizes channel responses and preserves channel state strings', () => {
    const normalized = normalizeFiberChannels([
      {
        channel_id: 'channel-1',
        state: 'CHANNEL_READY',
        local_balance: '1000',
        remote_balance: '500',
        asset_id: 'CKB',
        peer_id: 'peer-1'
      }
    ])

    expect(normalized).toEqual([
      {
        channelId: 'channel-1',
        state: 'CHANNEL_READY',
        localBalance: '1000',
        remoteBalance: '500',
        assetId: 'CKB',
        peerId: 'peer-1'
      }
    ])
  })

  it('rejects node responses with unsupported network values', () => {
    expect(() =>
      normalizeFiberNodeInfo({
        node_name: 'fiber-node',
        peer_id: 'peer-1',
        network: 'unknownnet',
        synced_to_graph: true,
        block_height: '42'
      })
    ).toThrow('Unsupported Fiber network in node_info response: unknownnet')
  })
})
