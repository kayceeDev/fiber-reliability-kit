import { afterEach, describe, expect, it, vi } from 'vitest'

import { executeCliCommand } from '../../src/index.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fiber-doctor command execution', () => {
  it('renders can-pay fixture output as computed JSON when requested', async () => {
    const output = await executeCliCommand([
      'can-pay',
      'fiber-fixture:network=testnet;asset=CKB;amount=700;expiresAt=2026-07-04T00:00:00.000Z',
      '--json',
      '--fixture',
      'graph-not-synced'
    ])

    const parsed = JSON.parse(output)

    expect(parsed.command).toBe('can-pay')
    expect(parsed.fixtureId).toBe('graph-not-synced')
    expect(parsed.diagnostics).toEqual(['GRAPH_NOT_SYNCED'])
  })

  it('renders can-pay fixture output as human-readable text by default', async () => {
    const output = await executeCliCommand([
      'can-pay',
      'fiber-fixture:network=testnet;asset=CKB;amount=700;expiresAt=2026-07-04T00:00:00.000Z',
      '--fixture',
      'graph-not-synced'
    ])

    expect(output).toContain('fiber-doctor can-pay')
    expect(output).toContain('graph-not-synced')
    expect(output).toContain('GRAPH_NOT_SYNCED')
  })

  it('renders can-pay from parse_invoice when an rpcUrl is provided with a real invoice string', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        async json() {
          return {
            jsonrpc: '2.0',
            id: 1,
            result: {
              invoice: {
                currency: 'Fibt',
                amount: '700',
                data: {
                  attrs: {
                    expiry_time: '2026-07-05T00:00:00.000Z'
                  }
                }
              }
            }
          }
        }
      })
    )

    const output = await executeCliCommand([
      'can-pay',
      'fibtest1realinvoice',
      '--json',
      '--rpc-url',
      'http://127.0.0.1:8227'
    ])

    const parsed = JSON.parse(output)

    expect(parsed.command).toBe('can-pay')
    expect(parsed.diagnostics).toEqual([])
  })

  it('renders node-health as computed JSON from a readiness fixture when requested', async () => {
    const output = await executeCliCommand([
      'node-health',
      '--json',
      '--fixture',
      'happy-payment'
    ])

    const parsed = JSON.parse(output)

    expect(parsed.command).toBe('node-health')
    expect(parsed.fixtureId).toBe('happy-payment')
    expect(parsed.diagnostics).toEqual([])
  })

  it('renders node-health from a live rpcUrl when a read-only RPC transport succeeds', async () => {
    const rpcResponses = [
      {
        jsonrpc: '2.0',
        id: 1,
        result: {
          node_name: 'fiber-node',
          peer_id: 'self',
          network: 'testnet',
          synced_to_graph: false,
          block_height: '42'
        }
      },
      {
        jsonrpc: '2.0',
        id: 1,
        result: [
          {
            peer_id: 'peer-1',
            connected: true
          }
        ]
      },
      {
        jsonrpc: '2.0',
        id: 1,
        result: [
          {
            channel_id: 'channel-1',
            state: 'CHANNEL_READY',
            local_balance: '1000',
            remote_balance: '900',
            asset_id: 'CKB',
            peer_id: 'peer-1'
          }
        ]
      }
    ]

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async () => ({
        ok: true,
        async json() {
          const next = rpcResponses.shift()

          if (!next) {
            throw new Error('No RPC response prepared for fetch stub.')
          }

          return next
        }
      }))
    )

    const output = await executeCliCommand([
      'node-health',
      '--json',
      '--rpc-url',
      'http://127.0.0.1:8227'
    ])

    const parsed = JSON.parse(output)

    expect(parsed.command).toBe('node-health')
    expect(parsed.mode).toBe('rpc')
    expect(parsed.rpcUrl).toBe('http://127.0.0.1:8227')
    expect(parsed.diagnostics).toEqual(['GRAPH_NOT_SYNCED'])
  })

  it('renders node-health as human-readable text by default', async () => {
    const output = await executeCliCommand(['node-health', '--fixture', 'graph-not-synced'])

    expect(output).toContain('fiber-doctor node-health')
    expect(output).toContain('graph-not-synced')
    expect(output).toContain('GRAPH_NOT_SYNCED')
  })

  it('rejects can-pay invocations that omit the invoice argument', async () => {
    await expect(executeCliCommand(['can-pay'])).rejects.toThrow(
      'can-pay requires an invoice argument'
    )
  })
})
