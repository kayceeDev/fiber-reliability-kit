import { describe, expect, it } from 'vitest'

import {
  fixtureSchemaVersion,
  loadReliabilityFixture,
  type ReliabilityFixture
} from '../src/index.js'

describe('reliability fixture loader', () => {
  it('loads a valid fixture from disk', async () => {
    const fixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/invoice-missing-amount.json', import.meta.url)
    )

    expect(fixtureSchemaVersion).toBe(1)
    expect(fixture.id).toBe('invoice-missing-amount')
    expect(fixture.input.intent.kind).toBe('invoice')
    expect(fixture.expected.diagnostics).toEqual(['INVOICE_AMOUNT_MISSING'])
  })

  it('rejects fixtures with missing required fields', async () => {
    await expect(
      loadReliabilityFixture(
        new URL('../../../fixtures/scenarios/invalid-missing-title.json', import.meta.url)
      )
    ).rejects.toThrow('Fixture title must be a non-empty string.')
  })

  it('rejects fixtures with unknown diagnostic codes', async () => {
    await expect(
      loadReliabilityFixture(
        new URL('../../../fixtures/scenarios/invalid-unknown-diagnostic.json', import.meta.url)
      )
    ).rejects.toThrow('Fixture expected diagnostics must use known diagnostic codes.')
  })

  it('supports manual fixtures with asset and target fields', async () => {
    const fixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/manual-peer-missing.json', import.meta.url)
    )

    const intent = fixture.input.intent

    if (intent.kind !== 'manual') {
      throw new Error('Expected a manual payment intent fixture.')
    }

    expect(intent.assetId).toBe('CKB')
    expect(intent.targetPubkey).toBe('0xpeer')
  })

  it('preserves the validated fixture shape for typed consumers', async () => {
    const fixture: ReliabilityFixture = await loadReliabilityFixture(
      new URL('../../../fixtures/scenarios/invoice-missing-amount.json', import.meta.url)
    )

    expect(fixture.expected.diagnostics[0]).toBe('INVOICE_AMOUNT_MISSING')
  })
})
