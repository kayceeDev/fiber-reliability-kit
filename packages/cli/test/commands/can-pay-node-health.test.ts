import { describe, expect, it } from 'vitest'

import { executeCliCommand } from '../../src/index.js'

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
