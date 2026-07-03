import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'

const rootDir = new URL('../../../../', import.meta.url)

async function readRootFile(fileName: string): Promise<string> {
  return readFile(new URL(fileName, rootDir), 'utf8')
}

describe('submission hardening docs', () => {
  it('documents what is fully working, optional live mode, mocked data, and production requirements', async () => {
    const readme = await readRootFile('README.md')

    expect(readme).toContain('Fully working')
    expect(readme).toContain('Optional live mode')
    expect(readme).toContain('Mocked/simulated')
    expect(readme).toContain('Production requirements')
  })

  it('includes runnable demo instructions in the README', async () => {
    const readme = await readRootFile('README.md')

    expect(readme).toContain('Runnable demo instructions')
    expect(readme).toContain('corepack pnpm install')
    expect(readme).toContain('corepack pnpm test')
  })

  it('includes a technical breakdown document for submission packaging', async () => {
    const breakdown = await readRootFile('TECHNICAL_BREAKDOWN.md')

    expect(breakdown).toContain('Fiber Reliability Kit')
    expect(breakdown).toContain('SDK')
    expect(breakdown).toContain('CLI')
    expect(breakdown).toContain('Reliability Lab')
  })

  it('includes a roadmap and limitations document', async () => {
    const roadmap = await readRootFile('ROADMAP.md')

    expect(roadmap).toContain('Near-term roadmap')
    expect(roadmap).toContain('Current limitations')
  })

  it('includes a short submission summary document', async () => {
    const summary = await readRootFile('SUBMISSION_SUMMARY.md')

    expect(summary).toContain('Node, Routing, Cross-Chain, and Diagnostics Infrastructure')
    expect(summary).toContain('Fiber Reliability Kit')
  })
})
