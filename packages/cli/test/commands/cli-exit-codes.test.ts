import { describe, expect, it } from 'vitest'

import { executeCliCommand, executeCliCommandDetailed } from '../../src/index.js'

describe('fiber-doctor snapshots and exit codes', () => {
  it('matches a stable JSON snapshot for can-pay', async () => {
    const output = await executeCliCommand([
      'can-pay',
      'fiber-fixture:network=testnet;asset=CKB;amount=700;expiresAt=2026-07-05T00:00:00.000Z',
      '--json',
      '--fixture',
      'graph-not-synced'
    ])

    expect(JSON.parse(output)).toMatchInlineSnapshot(`
      {
        "command": "can-pay",
        "diagnostics": [
          "GRAPH_NOT_SYNCED",
        ],
        "fixtureId": "graph-not-synced",
      }
    `)
  })

  it('matches a stable human-readable snapshot for explain-payment', async () => {
    const output = await executeCliCommand(['explain-payment', '0xmulti'])

    expect(output).toMatchInlineSnapshot(`
      "fiber-doctor explain-payment
      paymentHash: 0xmulti
      summary: Payment 0xmulti succeeded.
      failureKind: none
      diagnostics: none"
    `)
  })

  it('maps maximum diagnostic severity to exit codes', async () => {
    const healthy = await executeCliCommandDetailed([
      'node-health',
      '--fixture',
      'happy-payment'
    ])
    const warning = await executeCliCommandDetailed([
      'can-pay',
      'fiber-fixture:network=testnet;asset=CKB;amount=700;expiresAt=2026-07-05T00:00:00.000Z',
      '--fixture',
      'graph-not-synced'
    ])
    const error = await executeCliCommandDetailed([
      'liquidity',
      '--fixture',
      'insufficient-outbound-liquidity'
    ])
    const critical = await executeCliCommandDetailed([
      'cch',
      '0xstuck',
      '--fixture',
      'cch-order-stuck'
    ])

    expect(healthy.exitCode).toBe(0)
    expect(warning.exitCode).toBe(1)
    expect(error.exitCode).toBe(2)
    expect(critical.exitCode).toBe(3)
  })
})
