import { createDiagnostic } from '../diagnostics/taxonomy.js'
import type { DiagnosticItem } from '../diagnostics/types.js'

export type CchOrderDirection = 'incoming' | 'outgoing'
export type CchOrderStatus = 'PENDING' | 'IN_FLIGHT' | 'COMPLETED'

export type InspectCchOrderInput = {
  paymentHash: string
  direction: CchOrderDirection
  orderStatus: CchOrderStatus
  expiryDelta: number
  minSafeExpiryDelta: number
  feeBudget: string
  minSafeFeeBudget: string
}

export type CchOrderReport = {
  paymentHash: string
  direction: CchOrderDirection
  status: CchOrderStatus
  summary: string
  diagnostics: readonly DiagnosticItem[]
}

function summarizeReport(report: CchOrderReport): string {
  if (report.diagnostics.some((diagnostic) => diagnostic.code === 'CCH_ORDER_STUCK')) {
    return `CCH order ${report.paymentHash} appears stuck in ${report.status.toLowerCase()}.`
  }

  if (report.diagnostics.some((diagnostic) => diagnostic.code === 'CCH_EXPIRY_UNSAFE')) {
    return `CCH order ${report.paymentHash} has an unsafe expiry window.`
  }

  if (report.diagnostics.some((diagnostic) => diagnostic.code === 'CCH_FEE_BUDGET_UNSAFE')) {
    return `CCH order ${report.paymentHash} has an unsafe fee budget.`
  }

  return `CCH order ${report.paymentHash} looks healthy.`
}

export function inspectCchOrder(input: InspectCchOrderInput): CchOrderReport {
  const diagnostics: DiagnosticItem[] = []

  if (input.orderStatus === 'IN_FLIGHT') {
    diagnostics.push(
      createDiagnostic('CCH_ORDER_STUCK', {
        evidence: [
          { label: 'orderStatus', value: input.orderStatus },
          { label: 'direction', value: input.direction }
        ]
      })
    )
  }

  if (input.expiryDelta < input.minSafeExpiryDelta) {
    diagnostics.push(
      createDiagnostic('CCH_EXPIRY_UNSAFE', {
        evidence: [
          { label: 'expiryDelta', value: input.expiryDelta },
          { label: 'minSafeExpiryDelta', value: input.minSafeExpiryDelta }
        ]
      })
    )
  }

  const feeBudget = Number(input.feeBudget)
  const minSafeFeeBudget = Number(input.minSafeFeeBudget)

  if (!Number.isNaN(feeBudget) && !Number.isNaN(minSafeFeeBudget) && feeBudget < minSafeFeeBudget) {
    diagnostics.push(
      createDiagnostic('CCH_FEE_BUDGET_UNSAFE', {
        evidence: [
          { label: 'feeBudget', value: feeBudget },
          { label: 'minSafeFeeBudget', value: minSafeFeeBudget }
        ]
      })
    )
  }

  const report: CchOrderReport = {
    paymentHash: input.paymentHash,
    direction: input.direction,
    status: input.orderStatus,
    summary: '',
    diagnostics
  }

  return {
    ...report,
    summary: summarizeReport(report)
  }
}
