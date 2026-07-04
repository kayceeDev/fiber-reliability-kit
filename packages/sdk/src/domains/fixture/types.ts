import type { DiagnosticCode } from '../diagnostics/types.js'
import type { PaymentIntent } from '../payment-intent/types.js'
import type { PaymentAttempt, PaymentFlow } from '../payment-timeline/types.js'
import type {
  NormalizedFiberChannel,
  NormalizedFiberNodeInfo,
  NormalizedFiberPeer
} from '../../rpc/fiber-types.js'

export type FixtureReadinessContext = {
  node: NormalizedFiberNodeInfo
  peers: readonly NormalizedFiberPeer[]
  channels: readonly NormalizedFiberChannel[]
  routeAvailable: boolean
  targetPeerId: string
  routeFee?: string | undefined
  feeCap?: string | undefined
  routeExpiryDelta?: number | undefined
  minSafeExpiryDelta?: number | undefined
}

export type FixtureCchContext = {
  paymentHash: string
  direction: 'incoming' | 'outgoing'
  orderStatus: 'PENDING' | 'IN_FLIGHT' | 'COMPLETED'
  expiryDelta: number
  minSafeExpiryDelta: number
  feeBudget: string
  minSafeFeeBudget: string
}

export type FixturePaymentTimelineContext = {
  paymentHash: string
  paymentFlow: PaymentFlow
  attempts: readonly PaymentAttempt[]
}

export type ReliabilityFixture = {
  schemaVersion: 1
  id: string
  title: string
  description: string
  input: {
    intent: PaymentIntent
  }
  context?: {
    readiness?: FixtureReadinessContext | undefined
    cch?: FixtureCchContext | undefined
    paymentTimeline?: FixturePaymentTimelineContext | undefined
  } | undefined
  expected: {
    diagnostics: readonly DiagnosticCode[]
  }
}
