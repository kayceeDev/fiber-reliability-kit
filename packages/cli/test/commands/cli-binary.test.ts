import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'

import { executeCliCommandDetailed } from '../../src/index.js'

const cliRoot = new URL('../../', import.meta.url)

async function readCliFile(relativePath: string): Promise<string> {
  return readFile(new URL(relativePath, cliRoot), 'utf8')
}

describe('fiber-doctor runnable binary', () => {
  it('declares a bin entry and runnable script in package metadata', async () => {
    const packageJson = await readCliFile('package.json')

    expect(packageJson).toContain('"bin"')
    expect(packageJson).toContain('"fiber-doctor"')
    expect(packageJson).toContain('"doctor"')
  })

  it('wires the binary wrapper to the TypeScript entrypoint used by the command executor', async () => {
    const wrapper = await readCliFile('bin/fiber-doctor')
    const result = await executeCliCommandDetailed([
      'can-pay',
      'fiber-fixture:network=testnet;asset=CKB;amount=700;expiresAt=2026-07-05T00:00:00.000Z',
      '--json',
      '--fixture',
      'graph-not-synced'
    ])
    const parsed = JSON.parse(result.output)

    expect(wrapper).toContain('src/bin.ts')
    expect(result.exitCode).toBe(1)
    expect(parsed.command).toBe('can-pay')
    expect(parsed.fixtureId).toBe('graph-not-synced')
    expect(parsed.diagnostics).toEqual(['GRAPH_NOT_SYNCED'])
  })
})
