import { describe, expect, it } from 'vitest'
import { readdir } from 'node:fs/promises'

const scenarioDirectory = new URL('../../../fixtures/scenarios/', import.meta.url)

describe('fixture inventory', () => {
  it('includes the readiness scenarios required for wave 5A.1', async () => {
    const fileNames = await readdir(scenarioDirectory)

    expect(fileNames).toEqual(
      expect.arrayContaining([
        'happy-payment.json',
        'graph-not-synced.json',
        'no-route.json',
        'channel-not-ready.json',
        'channel-closed.json',
        'insufficient-outbound-liquidity.json',
        'insufficient-inbound-liquidity.json',
        'fee-cap-too-low.json',
        'expiry-unsafe.json'
      ])
    )
  })
})
