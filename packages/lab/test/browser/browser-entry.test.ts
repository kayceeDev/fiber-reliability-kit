import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'

const labRoot = new URL('../../', import.meta.url)

async function readLabFile(relativePath: string): Promise<string> {
  return readFile(new URL(relativePath, labRoot), 'utf8')
}

describe('browser-packaged Lab entry', () => {
  it('adds browser-oriented dev, build, and preview scripts to the Lab package', async () => {
    const packageJson = await readLabFile('package.json')

    expect(packageJson).toContain('"dev"')
    expect(packageJson).toContain('"build"')
    expect(packageJson).toContain('"preview"')
  })

  it('adds an HTML entry file for the packaged Lab app', async () => {
    const html = await readLabFile('index.html')

    expect(html).toContain('<!doctype html>')
    expect(html).toContain('<div id="app"></div>')
    expect(html).toContain('src/browser/main.ts')
  })

  it('adds a browser entry module that renders the packaged Lab document', async () => {
    const main = await readLabFile('src/browser/main.ts')

    expect(main).toContain('renderReliabilityLabDocument')
    expect(main).toContain('document.getElementById')
  })
})
