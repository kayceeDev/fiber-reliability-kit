import { createDiagnostic } from '../diagnostics/taxonomy.js'
import type { DiagnosticItem } from '../diagnostics/types.js'
import type { NormalizedFiberChannel } from '../../rpc/fiber-types.js'

export type PlanRebalanceInput = {
  targetPeerId: string
  assetId: string
  desiredLocalBalance: string
  channels: readonly NormalizedFiberChannel[]
  projectedFee: string
  feeBudget: string
}

export type RebalancePlanReport = {
  targetPeerId: string
  assetId: string
  projectedDelta: string
  summary: string
  diagnostics: readonly DiagnosticItem[]
}

function normalizeAssetId(assetId: string): string {
  return assetId === 'CKB' ? 'CKB' : assetId
}

function summarizeReport(projectedDelta: string): string {
  if (projectedDelta === '0') {
    return 'Target already has the desired local balance, so no rebalance is needed.'
  }

  return `Dry-run rebalance suggests shifting ${projectedDelta} units toward the target peer.`
}

export function planRebalance(input: PlanRebalanceInput): RebalancePlanReport {
  const targetChannels = input.channels.filter(
    (channel) =>
      channel.peerId === input.targetPeerId &&
      normalizeAssetId(channel.assetId) === normalizeAssetId(input.assetId)
  )

  const currentLocalBalance = targetChannels.reduce(
    (sum, channel) => sum + Number(channel.localBalance),
    0
  )
  const desiredLocalBalance = Number(input.desiredLocalBalance)
  const projectedFee = Number(input.projectedFee)
  const feeBudget = Number(input.feeBudget)

  const projectedDelta = Math.max(0, desiredLocalBalance - currentLocalBalance)
  const diagnostics: DiagnosticItem[] = []

  if (!Number.isNaN(projectedFee) && !Number.isNaN(feeBudget) && projectedFee > feeBudget) {
    diagnostics.push(createDiagnostic('FEE_CAP_TOO_LOW'))
  }

  return {
    targetPeerId: input.targetPeerId,
    assetId: input.assetId,
    projectedDelta: String(projectedDelta),
    summary: summarizeReport(String(projectedDelta)),
    diagnostics
  }
}
