import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'

const labRoot = new URL('../../', import.meta.url)

async function readLabFile(relativePath: string): Promise<string> {
  return readFile(new URL(relativePath, labRoot), 'utf8')
}

describe('browser-packaged Lab entry', () => {
  it('adds Tailwind dependencies and Vite plugin configuration to the Lab package', async () => {
    const packageJson = await readLabFile('package.json')
    const viteConfig = await readLabFile('vite.config.ts')

    expect(packageJson).toContain('"tailwindcss"')
    expect(packageJson).toContain('"@tailwindcss/vite"')
    expect(viteConfig).toContain('@tailwindcss/vite')
    expect(viteConfig).toContain('tailwindcss()')
  })

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

  it('adds a browser entry module that renders the packaged Lab app and imports Tailwind styles', async () => {
    const main = await readLabFile('src/browser/main.ts')

    expect(main).toContain("import './styles.css'")
    expect(main).toContain('renderReliabilityLabApp')
    expect(main).toContain('document.getElementById')
  })

  it('adds a Tailwind stylesheet entrypoint', async () => {
    const styles = await readLabFile('src/browser/styles.css')

    expect(styles).toContain('@import "tailwindcss";')
    expect(styles).toContain('font-family')
  })
})
