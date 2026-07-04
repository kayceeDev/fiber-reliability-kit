import { describe, expect, it } from 'vitest'

import {
  createScenarioPickerState,
  listFixtureScenarios,
  selectScenario,
  type ScenarioSummary
} from '../../src/index.js'

describe('lab scenario scaffold', () => {
  it('lists the available valid fixture scenarios for the lab picker', async () => {
    const scenarios = await listFixtureScenarios()

    expect(scenarios.map((scenario) => scenario.id)).toEqual([
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

  it('returns scenario summaries with title and description', async () => {
    const scenarios = await listFixtureScenarios()
    const firstScenario: ScenarioSummary | undefined = scenarios[0]

    expect(firstScenario?.title).toBe('CCH fee budget unsafe')
    expect(firstScenario?.description).toContain('fee budget')
  })

  it('builds picker state with the first scenario selected by default', async () => {
    const state = await createScenarioPickerState()

    expect(state.selectedScenarioId).toBe('cch-fee-budget-unsafe')
    expect(state.scenarios).toHaveLength(15)
  })

  it('updates picker state when a new scenario is selected', async () => {
    const state = await createScenarioPickerState()
    const nextState = selectScenario(state, 'manual-peer-missing')

    expect(nextState.selectedScenarioId).toBe('manual-peer-missing')
  })

  it('rejects selection of a scenario that is not available in the picker', async () => {
    const state = await createScenarioPickerState()

    expect(() => selectScenario(state, 'invalid-missing-title')).toThrow(
      'Unknown lab scenario: invalid-missing-title'
    )
  })
})
