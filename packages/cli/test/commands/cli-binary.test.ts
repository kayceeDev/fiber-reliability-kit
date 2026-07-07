import { describe, expect, it } from 'vitest'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile } from 'node:fs/promises'

const execFileAsync = promisify(execFile)
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

  it('runs the fiber-doctor binary entrypoint through the package wrapper', async () => {
    let stdout = ''
    let exitCode: number | undefined

    try {
      const result = await execFileAsync(
        'packages/cli/bin/fiber-doctor',
        [
          'can-pay',
          'fiber-fixture:network=testnet;asset=CKB;amount=700;expiresAt=2026-07-05T00:00:00.000Z',
          '--json',
          '--fixture',
          'graph-not-synced'
        ],
        {
          cwd: new URL('../../../../', import.meta.url).pathname
        }
      )

      stdout = result.stdout
      exitCode = 0
    } catch (error) {
      const execError = error as Error & { code?: number; stdout?: string }
      stdout = execError.stdout ?? ''
      exitCode = execError.code
    }

    const parsed = JSON.parse(stdout)

    expect(exitCode).toBe(1)
    expect(parsed.command).toBe('can-pay')
    expect(parsed.fixtureId).toBe('graph-not-synced')
    expect(parsed.diagnostics).toEqual(['GRAPH_NOT_SYNCED'])
  })
})
