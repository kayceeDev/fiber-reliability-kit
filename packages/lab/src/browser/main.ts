import './styles.css'

import { renderReliabilityLabApp } from '../app/render-lab-app.js'
import { getLabScenarioManifest } from '../data/scenario-manifest.js'

type ScenarioRouteMode = 'replace' | 'push' | 'none'

function getDefaultScenarioId(scenarioIds: ReadonlySet<string>, fallbackScenarioId: string): string {
  const routeScenarioId = new URLSearchParams(window.location.search).get('scenario')

  return routeScenarioId && scenarioIds.has(routeScenarioId) ? routeScenarioId : fallbackScenarioId
}

function updateScenarioRoute(scenarioId: string, mode: ScenarioRouteMode) {
  if (mode === 'none') {
    return
  }

  const url = new URL(window.location.href)
  url.searchParams.set('scenario', scenarioId)

  if (mode === 'replace') {
    window.history.replaceState({}, '', url)
    return
  }

  window.history.pushState({}, '', url)
}

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
  const scenarioIds: ReadonlySet<string> = new Set(scenarios.map((scenario) => scenario.id))
  const fallbackScenarioId = scenarios[0]?.id || 'happy-payment'

  for (const scenario of scenarios) {
    const option = document.createElement('option')
    option.value = scenario.id
    option.textContent = scenario.title
    scenarioSelect.appendChild(option)
  }

  const initialScenarioId = getDefaultScenarioId(scenarioIds, fallbackScenarioId)

  await renderScenario(initialScenarioId)
  updateScenarioRoute(initialScenarioId, 'replace')

  scenarioSelect.addEventListener('change', async () => {
    if (!scenarioIds.has(scenarioSelect.value)) {
      return
    }

    await renderScenario(scenarioSelect.value)
    updateScenarioRoute(scenarioSelect.value, 'push')
  })

  document.addEventListener('click', async (event) => {
    const target = event.target

    if (!(target instanceof Element)) {
      return
    }

    const scenarioButton = target.closest<HTMLElement>('[data-scenario-id]')
    const scenarioId = scenarioButton?.dataset.scenarioId

    if (!scenarioId || !scenarioIds.has(scenarioId)) {
      return
    }

    await renderScenario(scenarioId)
    updateScenarioRoute(scenarioId, 'push')
  })

  window.addEventListener('popstate', async () => {
    const scenarioId = getDefaultScenarioId(scenarioIds, fallbackScenarioId)

    await renderScenario(scenarioId)
  })
}

void bootstrapLab()
