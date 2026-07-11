import { describe, expect, it } from 'vitest'

import { renderReliabilityLabApp } from '../../src/index.js'

describe('renderReliabilityLabApp', () => {
  it('renders a responsive Lab shell with a scenario rail and active scenario state', async () => {
    const html = await renderReliabilityLabApp({
      scenarioId: 'graph-not-synced'
    })

    expect(html).toContain('data-testid="lab-shell"')
    expect(html).toContain('lg:grid-cols-[320px_minmax(0,1fr)]')
    expect(html).toContain('data-testid="scenario-rail"')
    expect(html).toContain('hidden rounded-3xl')
    expect(html).toContain('lg:top-24')
    expect(html).toContain('lg:max-h-[calc(100vh-7rem)]')
    expect(html).toContain('Scenario library')
    expect(html).toContain('graph-not-synced')
    expect(html).toContain('aria-current="true"')
  })

  it('renders styled diagnostic cards, severity badges, recovery actions, and evidence rows', async () => {
    const html = await renderReliabilityLabApp({
      scenarioId: 'graph-not-synced'
    })

    expect(html).toContain('data-testid="diagnostic-card"')
    expect(html).toContain('rounded-2xl')
    expect(html).toContain('GRAPH_NOT_SYNCED')
    expect(html).toContain('Warning')
    expect(html).toContain('bg-amber-100')
    expect(html).toContain('Wait for sync')
    expect(html).toContain('Evidence')
    expect(html).toContain('Recovery actions')
  })

  it('renders the payment explanation panel with timeline entries when a payment explanation is requested', async () => {
    const html = await renderReliabilityLabApp({
      scenarioId: 'payment-succeeded-after-retry',
      paymentHash: '0xmulti'
    })

    expect(html).toContain('Payment explanation')
    expect(html).toContain('PAYMENT_SUCCEEDED')
    expect(html).toContain('Timeline events')
    expect(html).toContain('data-testid="payment-timeline-panel"')
  })

  it('renders the route and liquidity panel with asset and diagnostic pills when a readiness scenario is selected', async () => {
    const html = await renderReliabilityLabApp({
      scenarioId: 'insufficient-outbound-liquidity'
    })

    expect(html).toContain('Route and liquidity')
    expect(html).toContain('INSUFFICIENT_OUTBOUND_LIQUIDITY')
    expect(html).toContain('CKB')
    expect(html).toContain('data-testid="route-liquidity-panel"')
  })

  it('renders a polished mocked-vs-local data mode banner and keeps fixture-only mode by default', async () => {
    const html = await renderReliabilityLabApp({
      scenarioId: 'happy-payment'
    })

    expect(html).toContain('data-testid="data-mode-banner"')
    expect(html).toContain('Mocked fixture data only')
    expect(html).toContain('Local RPC disabled')
    expect(html).toContain('bg-emerald-50')
  })
})
