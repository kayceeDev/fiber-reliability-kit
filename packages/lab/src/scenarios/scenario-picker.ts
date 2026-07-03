import { loadReliabilityFixture, type ReliabilityFixture } from '@fiber-reliability/sdk'

const scenarioFileNames = [
  'invoice-missing-amount.json',
  'manual-peer-missing.json'
] as const

export type ScenarioSummary = {
  id: string
  title: string
  description: string
}

export type ScenarioPickerState = {
  scenarios: readonly ScenarioSummary[]
  selectedScenarioId: string
}

function toScenarioSummary(fixture: ReliabilityFixture): ScenarioSummary {
  return {
    id: fixture.id,
    title: fixture.title,
    description: fixture.description
  }
}

export async function listFixtureScenarios(): Promise<ScenarioSummary[]> {
  const scenarios = await Promise.all(
    scenarioFileNames.map((fileName) =>
      loadReliabilityFixture(
        new URL(`../../../../fixtures/scenarios/${fileName}`, import.meta.url)
      )
    )
  )

  return scenarios.map(toScenarioSummary)
}

export async function createScenarioPickerState(): Promise<ScenarioPickerState> {
  const scenarios = await listFixtureScenarios()
  const firstScenario = scenarios[0]

  if (!firstScenario) {
    throw new Error('No lab scenarios are available.')
  }

  return {
    scenarios,
    selectedScenarioId: firstScenario.id
  }
}

export function selectScenario(
  state: ScenarioPickerState,
  scenarioId: string
): ScenarioPickerState {
  const exists = state.scenarios.some((scenario) => scenario.id === scenarioId)

  if (!exists) {
    throw new Error(`Unknown lab scenario: ${scenarioId}`)
  }

  return {
    ...state,
    selectedScenarioId: scenarioId
  }
}
