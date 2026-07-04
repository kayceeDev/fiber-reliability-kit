import { renderReliabilityLabDocument } from '../app/render-lab-document.js'
import { getLabScenarioManifest } from '../data/scenario-manifest.js'

async function renderScenario(scenarioId: string) {
  const mount = document.getElementById('app')

  if (!mount) {
    throw new Error('Reliability Lab mount point #app was not found.')
  }

  const html = await renderReliabilityLabDocument({
    scenarioId
  })

  mount.innerHTML = html
}

async function bootstrapLab() {
  const scenarioSelect = document.getElementById('scenario-select') as HTMLSelectElement | null

  if (!scenarioSelect) {
    throw new Error('Reliability Lab scenario select #scenario-select was not found.')
  }

  const scenarios = getLabScenarioManifest()

  for (const scenario of scenarios) {
    const option = document.createElement('option')
    option.value = scenario.id
    option.textContent = scenario.title
    scenarioSelect.appendChild(option)
  }

  const initialScenarioId = scenarioSelect.value || scenarios[0]?.id || 'happy-payment'

  await renderScenario(initialScenarioId)

  scenarioSelect.addEventListener('change', async () => {
    await renderScenario(scenarioSelect.value)
  })
}

void bootstrapLab()
