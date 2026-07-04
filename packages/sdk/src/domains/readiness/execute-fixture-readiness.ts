import type { ReliabilityFixture } from '../fixture/types.js'
import type { CheckReadinessInput, ReadinessReport } from './types.js'
import { checkReadiness } from './check-readiness.js'

function toCheckReadinessInput(fixture: ReliabilityFixture): CheckReadinessInput {
  const readiness = fixture.context?.readiness

  if (!readiness) {
    throw new Error('Fixture readiness context is required for readiness execution.')
  }

  return {
    intent: fixture.input.intent,
    node: readiness.node,
    peers: readiness.peers,
    channels: readiness.channels,
    routeAvailable: readiness.routeAvailable,
    targetPeerId: readiness.targetPeerId,
    routeFee: readiness.routeFee,
    feeCap: readiness.feeCap,
    routeExpiryDelta: readiness.routeExpiryDelta,
    minSafeExpiryDelta: readiness.minSafeExpiryDelta
  }
}

export function executeFixtureReadiness(fixture: ReliabilityFixture): ReadinessReport {
  return checkReadiness(toCheckReadinessInput(fixture))
}
