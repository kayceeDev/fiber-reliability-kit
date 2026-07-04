import { inspectCchOrder } from './inspect-cch-order.js'
import type { CchOrderReport } from './inspect-cch-order.js'
import type { ReliabilityFixture } from '../fixture/types.js'

export function executeFixtureCchInspection(
  fixture: ReliabilityFixture
): CchOrderReport {
  const cch = fixture.context?.cch

  if (!cch) {
    throw new Error('Fixture CCH context is required for CCH inspection execution.')
  }

  return inspectCchOrder(cch)
}
