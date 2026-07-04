import { describe, expect, it } from 'vitest'

import { getLabScenarioManifest } from '../../src/index.js'

describe('lab scenario manifest', () => {
  it('exposes the current valid fixture scenarios through a browser-safe manifest', () => {
    const manifest = getLabScenarioManifest()

    expect(manifest.map((scenario) => scenario.id)).toEqual([
      'cch-fee-budget-unsafe',
      'cch-order-stuck',
      'channel-closed',
      'channel-not-ready',
      'expiry-unsafe',
      'fee-cap-too-low',
      'graph-not-synced',
      'happy-payment',
      'insufficient-inbound-liquidity',
      'insufficient-outbound-liquidity',
      'invoice-missing-amount',
      'manual-peer-missing',
      'no-route',
      'payment-retryable-failure',
      'payment-succeeded-after-retry'
    ])
  })

  it('includes titles and descriptions needed by browser-facing scenario selection', () => {
    const first = getLabScenarioManifest()[0]

    expect(first?.title).toBe('CCH fee budget unsafe')
    expect(first?.description).toContain('fee budget')
  })
})
