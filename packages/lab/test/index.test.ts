import { describe, expect, it } from 'vitest'

import { labPackageName } from '../src/index.js'

describe('lab workspace scaffold', () => {
  it('exports the lab package name', () => {
    expect(labPackageName).toBe('fiber-reliability-lab')
  })
})
