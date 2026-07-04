import type { DiagnosticItem } from '../diagnostics/types.js'
import type { PaymentIntent } from '../payment-intent/types.js'
import type {
  NormalizedFiberChannel,
  NormalizedFiberNodeInfo,
  NormalizedFiberPeer
} from '../../rpc/fiber-types.js'

export type CheckReadinessInput = {
  intent: PaymentIntent
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

export type ReadinessReport = {
  intent: PaymentIntent
  diagnostics: DiagnosticItem[]
}
