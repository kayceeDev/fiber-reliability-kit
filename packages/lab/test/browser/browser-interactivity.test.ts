import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'

const labRoot = new URL('../../', import.meta.url)

async function readLabFile(relativePath: string): Promise<string> {
  return readFile(new URL(relativePath, labRoot), 'utf8')
}

describe('browser-packaged Lab interactivity', () => {
  it('adds a fixed navbar with a mobile failure-story select control to the HTML shell', async () => {
    const html = await readLabFile('index.html')

    expect(html).toContain('<header class="fixed inset-x-0 top-0 z-50')
    expect(html).toContain('pt-40')
    expect(html).toContain('id="scenario-select"')
    expect(html).toContain('for="scenario-select"')
    expect(html).toContain('Failure story')
    expect(html).toContain('lg:hidden')
  })

  it('wires change handling in the browser entry module', async () => {
    const main = await readLabFile('src/browser/main.ts')

    expect(main).toContain('scenarioSelect.addEventListener')
    expect(main).toContain('data-scenario-id')
    expect(main).toContain('renderScenario')
  })

  it('persists the selected scenario in a static-hosting-safe query parameter', async () => {
    const main = await readLabFile('src/browser/main.ts')

    expect(main).toContain('new URLSearchParams(window.location.search)')
    expect(main).toContain(".get('scenario')")
    expect(main).toContain("url.searchParams.set('scenario', scenarioId)")
    expect(main).toContain('window.history.pushState')
    expect(main).toContain('window.history.replaceState')
  })

  it('validates routed scenario ids and supports browser back and forward navigation', async () => {
    const main = await readLabFile('src/browser/main.ts')

    expect(main).toContain('scenarioIds.has(routeScenarioId)')
    expect(main).toContain('fallbackScenarioId')
    expect(main).toContain("window.addEventListener('popstate'")
    expect(main).toContain("updateScenarioRoute(initialScenarioId, 'replace')")
  })

  it('reads the selected scenario value when rerendering the Lab surface', async () => {
    const main = await readLabFile('src/browser/main.ts')

    expect(main).toContain('scenarioSelect.value')
    expect(main).toContain('renderReliabilityLabApp')
  })
})
