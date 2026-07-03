import { describe, expect, it } from 'vitest'

import { cliPackageName } from '../src/index.js'

describe('cli workspace scaffold', () => {
  it('exports the cli package name', () => {
    expect(cliPackageName).toBe('fiber-doctor')
  })
})
