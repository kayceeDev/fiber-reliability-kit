import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'

const labRoot = new URL('../../', import.meta.url)

async function readLabFile(relativePath: string): Promise<string> {
  return readFile(new URL(relativePath, labRoot), 'utf8')
}

describe('browser-packaged Lab interactivity', () => {
  it('adds a scenario select control to the HTML shell', async () => {
    const html = await readLabFile('index.html')

    expect(html).toContain('id="scenario-select"')
    expect(html).toContain('<label for="scenario-select">Scenario</label>')
  })

  it('wires change handling in the browser entry module', async () => {
    const main = await readLabFile('src/browser/main.ts')

    expect(main).toContain('scenarioSelect.addEventListener')
    expect(main).toContain('renderScenario')
  })

  it('reads the selected scenario value when rerendering the Lab surface', async () => {
    const main = await readLabFile('src/browser/main.ts')

    expect(main).toContain('scenarioSelect.value')
    expect(main).toContain('renderReliabilityLabDocument')
  })
})
