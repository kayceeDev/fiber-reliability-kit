import { describe, expect, it } from 'vitest'

import { loadReliabilityFixture } from '../src/index.js'

describe('reliability fixture readiness context', () => {
  it('loads readiness context for a happy-payment scenario', async () => {
    const fixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/happy-payment.json', import.meta.url)
    )

    expect(fixture.context?.readiness?.node.graphSynced).toBe(true)
    expect(fixture.context?.readiness?.channels[0]?.state).toBe('CHANNEL_READY')
    expect(fixture.expected.diagnostics).toEqual([])
  })

  it('loads readiness context for graph-not-synced and no-route scenarios', async () => {
    const graphFixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/graph-not-synced.json', import.meta.url)
    )
    const noRouteFixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/no-route.json', import.meta.url)
    )

    expect(graphFixture.context?.readiness?.node.graphSynced).toBe(false)
    expect(graphFixture.expected.diagnostics).toContain('GRAPH_NOT_SYNCED')
    expect(noRouteFixture.context?.readiness?.routeAvailable).toBe(false)
    expect(noRouteFixture.expected.diagnostics).toContain('NO_ROUTE')
  })

  it('loads readiness context for channel and liquidity scenarios', async () => {
    const pendingFixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/channel-not-ready.json', import.meta.url)
    )
    const outboundFixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/insufficient-outbound-liquidity.json', import.meta.url)
    )

    expect(pendingFixture.context?.readiness?.channels[0]?.state).toBe('CHANNEL_PENDING')
    expect(pendingFixture.expected.diagnostics).toContain('CHANNEL_NOT_READY')
    expect(outboundFixture.context?.readiness?.channels[0]?.localBalance).toBe('600')
    expect(outboundFixture.expected.diagnostics).toContain('INSUFFICIENT_OUTBOUND_LIQUIDITY')
  })

  it('loads readiness context for fee-cap and expiry scenarios', async () => {
    const feeFixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/fee-cap-too-low.json', import.meta.url)
    )
    const expiryFixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/expiry-unsafe.json', import.meta.url)
    )

    expect(feeFixture.context?.readiness?.routeFee).toBe('150')
    expect(feeFixture.context?.readiness?.feeCap).toBe('100')
    expect(feeFixture.expected.diagnostics).toContain('FEE_CAP_TOO_LOW')
    expect(expiryFixture.context?.readiness?.routeExpiryDelta).toBe(12)
    expect(expiryFixture.expected.diagnostics).toContain('EXPIRY_UNSAFE')
  })

  it('covers the first readiness scenario set promised by the new fixture expansion wave', async () => {
    const fixtureIds = [
      'happy-payment',
      'graph-not-synced',
      'no-route',
      'channel-not-ready',
      'channel-closed',
      'insufficient-outbound-liquidity',
      'insufficient-inbound-liquidity',
      'fee-cap-too-low',
      'expiry-unsafe'
    ] as const

    const fixtures = await Promise.all(
      fixtureIds.map((id) =>
        loadReliabilityFixture(new URL(`../../../fixtures/scenarios/${id}.json`, import.meta.url))
      )
    )

    expect(fixtures.map((fixture) => fixture.id)).toEqual([...fixtureIds])
  })
})
