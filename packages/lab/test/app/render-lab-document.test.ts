import { describe, expect, it } from 'vitest'

import { renderReliabilityLabDocument } from '../../src/index.js'

describe('renderReliabilityLabDocument', () => {
  it('renders a full HTML document with title and styled app shell', async () => {
    const html = await renderReliabilityLabDocument({
      scenarioId: 'graph-not-synced'
    })

    expect(html).toContain('<!doctype html>')
    expect(html).toContain('<title>Fiber Reliability Lab</title>')
    expect(html).toContain('Diagnose Fiber payments before users get stuck.')
    expect(html).toContain('class="min-h-screen')
  })

  it('embeds the rendered Lab content inside semantic document landmarks', async () => {
    const html = await renderReliabilityLabDocument({
      scenarioId: 'insufficient-outbound-liquidity'
    })

    expect(html).toContain('<main')
    expect(html).toContain('Scenario library')
    expect(html).toContain('Diagnostic report')
    expect(html).toContain('Route and liquidity')
  })

  it('renders a mocked-vs-local banner in the document shell', async () => {
    const html = await renderReliabilityLabDocument({
      scenarioId: 'happy-payment'
    })

    expect(html).toContain('Mocked fixture data only')
    expect(html).toContain('Local RPC disabled')
    expect(html).toContain('data-testid="data-mode-banner"')
  })

  it('renders the payment explanation panel inside the HTML document when requested', async () => {
    const html = await renderReliabilityLabDocument({
      scenarioId: 'payment-succeeded-after-retry',
      paymentHash: '0xmulti'
    })

    expect(html).toContain('Payment explanation')
    expect(html).toContain('PAYMENT_SUCCEEDED')
  })

  it('keeps the selected scenario visible in the document shell', async () => {
    const html = await renderReliabilityLabDocument({
      scenarioId: 'graph-not-synced'
    })

    expect(html).toContain('Selected scenario')
    expect(html).toContain('graph-not-synced')
    expect(html).toContain('aria-current="true"')
  })
})
