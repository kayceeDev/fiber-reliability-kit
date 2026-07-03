import { describe, expect, it } from 'vitest'

import { sdkPackageName } from '../src/index.js'

describe('sdk workspace scaffold', () => {
  it('exports the sdk package name', () => {
    expect(sdkPackageName).toBe('@fiber-reliability/sdk')
  })
})
