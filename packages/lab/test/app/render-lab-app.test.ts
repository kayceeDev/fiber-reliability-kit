import { describe, expect, it } from 'vitest'

import { renderReliabilityLabApp } from '../../src/index.js'

describe('renderReliabilityLabApp', () => {
  it('renders a scenario picker with the current selected scenario and section headings', async () => {
    const html = await renderReliabilityLabApp({
      scenarioId: 'graph-not-synced'
    })

    expect(html).toContain('Fiber Reliability Lab')
    expect(html).toContain('Scenario picker')
    expect(html).toContain('graph-not-synced')
    expect(html).toContain('Selected scenario')
  })

  it('renders diagnostic cards, recovery actions, and evidence placeholders for the selected scenario', async () => {
    const html = await renderReliabilityLabApp({
      scenarioId: 'graph-not-synced'
    })

    expect(html).toContain('GRAPH_NOT_SYNCED')
    expect(html).toContain('warning')
    expect(html).toContain('Wait for sync')
    expect(html).toContain('Evidence')
  })

  it('renders the payment explanation panel with timeline entries when a payment explanation is requested', async () => {
    const html = await renderReliabilityLabApp({
      scenarioId: 'payment-succeeded-after-retry',
      paymentHash: '0xmulti'
    })

    expect(html).toContain('Payment explanation')
    expect(html).toContain('PAYMENT_SUCCEEDED')
    expect(html).toContain('Timeline events')
    expect(html).toContain('succeeded')
  })

  it('renders the route and liquidity panel with asset and diagnostic details when a readiness scenario is selected', async () => {
    const html = await renderReliabilityLabApp({
      scenarioId: 'insufficient-outbound-liquidity'
    })

    expect(html).toContain('Route and liquidity')
    expect(html).toContain('INSUFFICIENT_OUTBOUND_LIQUIDITY')
    expect(html).toContain('CKB')
    expect(html).toContain('Diagnostic codes')
  })

  it('renders a clearer mocked-vs-local data mode section and keeps fixture-only mode by default', async () => {
    const html = await renderReliabilityLabApp({
      scenarioId: 'happy-payment'
    })

    expect(html).toContain('Data mode')
    expect(html).toContain('Mocked fixture data only')
    expect(html).toContain('Local RPC status')
  })
})
