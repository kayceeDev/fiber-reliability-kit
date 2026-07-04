import { describe, expect, it } from 'vitest'

import {
  executeFixtureReadiness,
  loadReliabilityFixture
} from '../src/index.js'

describe('fixture-driven readiness execution', () => {
  it('computes a clean readiness report for the happy-payment fixture', async () => {
    const fixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/happy-payment.json', import.meta.url)
    )

    const report = executeFixtureReadiness(fixture)

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([])
    expect(report.intent.kind).toBe('invoice')
  })

  it('matches computed diagnostics to graph and route fixture expectations', async () => {
    const graphFixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/graph-not-synced.json', import.meta.url)
    )
    const noRouteFixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/no-route.json', import.meta.url)
    )

    expect(executeFixtureReadiness(graphFixture).diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
      graphFixture.expected.diagnostics
    )
    expect(executeFixtureReadiness(noRouteFixture).diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
      noRouteFixture.expected.diagnostics
    )
  })

  it('matches computed diagnostics to channel and liquidity fixture expectations', async () => {
    const fixtures = await Promise.all([
      loadReliabilityFixture(new URL('../../../fixtures/scenarios/channel-not-ready.json', import.meta.url)),
      loadReliabilityFixture(new URL('../../../fixtures/scenarios/channel-closed.json', import.meta.url)),
      loadReliabilityFixture(new URL('../../../fixtures/scenarios/insufficient-outbound-liquidity.json', import.meta.url)),
      loadReliabilityFixture(new URL('../../../fixtures/scenarios/insufficient-inbound-liquidity.json', import.meta.url))
    ])

    for (const fixture of fixtures) {
      expect(executeFixtureReadiness(fixture).diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
        fixture.expected.diagnostics
      )
    }
  })

  it('matches computed diagnostics to fee and expiry fixture expectations', async () => {
    const feeFixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/fee-cap-too-low.json', import.meta.url)
    )
    const expiryFixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/expiry-unsafe.json', import.meta.url)
    )

    expect(executeFixtureReadiness(feeFixture).diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
      feeFixture.expected.diagnostics
    )
    expect(executeFixtureReadiness(expiryFixture).diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
      expiryFixture.expected.diagnostics
    )
  })

  it('rejects fixtures that do not contain readiness context', async () => {
    const fixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/invoice-missing-amount.json', import.meta.url)
    )

    expect(() => executeFixtureReadiness(fixture)).toThrow(
      'Fixture readiness context is required for readiness execution.'
    )
  })
})
