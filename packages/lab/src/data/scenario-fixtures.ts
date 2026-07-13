import {
  parseReliabilityFixtureData,
  type ReliabilityFixture
} from '@nwobodoleonard/fiber-reliability-sdk'

const rawScenarioFixtures = import.meta.glob('../../../../fixtures/scenarios/*.json', {
  eager: true,
  import: 'default'
}) as Record<string, unknown>

function toScenarioPath(scenarioId: string): string {
  return `../../../../fixtures/scenarios/${scenarioId}.json`
}

export type BrowserScenarioId =
  | 'cch-fee-budget-unsafe'
  | 'cch-order-stuck'
  | 'channel-closed'
  | 'channel-not-ready'
  | 'expiry-unsafe'
  | 'fee-cap-too-low'
  | 'graph-not-synced'
  | 'happy-payment'
  | 'insufficient-inbound-liquidity'
  | 'insufficient-outbound-liquidity'
  | 'invoice-missing-amount'
  | 'manual-peer-missing'
  | 'no-route'
  | 'payment-retryable-failure'
  | 'payment-succeeded-after-retry'

export function getBrowserScenarioFixture(scenarioId: BrowserScenarioId): ReliabilityFixture {
  const rawFixture = rawScenarioFixtures[toScenarioPath(scenarioId)]

  if (!rawFixture) {
    throw new Error(`Unknown browser scenario fixture: ${scenarioId}`)
  }

  return parseReliabilityFixtureData(rawFixture)
}
