import './styles.css'

import { renderReliabilityLabApp } from '../app/render-lab-app.js'
import { getLabScenarioManifest } from '../data/scenario-manifest.js'

async function renderScenario(scenarioId: string) {
  const mount = document.getElementById('app')
  const scenarioSelect = document.getElementById('scenario-select') as HTMLSelectElement | null

  if (!mount) {
    throw new Error('Reliability Lab mount point #app was not found.')
  }

  const html = await renderReliabilityLabApp({
    scenarioId
  })

  mount.innerHTML = html

  if (scenarioSelect && scenarioSelect.value !== scenarioId) {
    scenarioSelect.value = scenarioId
  }
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

  document.addEventListener('click', async (event) => {
    const target = event.target

    if (!(target instanceof Element)) {
      return
    }

    const scenarioButton = target.closest<HTMLElement>('[data-scenario-id]')
    const scenarioId = scenarioButton?.dataset.scenarioId

    if (!scenarioId) {
      return
    }

    await renderScenario(scenarioId)
  })
}

void bootstrapLab()
