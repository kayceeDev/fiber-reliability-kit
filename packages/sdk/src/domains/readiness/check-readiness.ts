import { createDiagnostic } from '../diagnostics/taxonomy.js'
import { analyzePaymentIntent } from '../payment-intent/analyze-payment-intent.js'
import type { PaymentIntent } from '../payment-intent/types.js'
import type { NormalizedFiberChannel, NormalizedFiberPeer } from '../../rpc/fiber-types.js'
import type { CheckReadinessInput, ReadinessReport } from './types.js'

function hasConnectedPeer(peers: readonly NormalizedFiberPeer[], targetPeerId: string): boolean {
  return peers.some((peer) => peer.peerId === targetPeerId && peer.connected)
}

function findTargetPeerChannels(
  channels: readonly NormalizedFiberChannel[],
  targetPeerId: string
): NormalizedFiberChannel[] {
  return channels.filter((channel) => channel.peerId === targetPeerId)
}

function createEmptyReport(intent: PaymentIntent): ReadinessReport {
  return {
    intent,
    diagnostics: []
  }
}

function normalizeChannelAssetId(channel: NormalizedFiberChannel): string {
  return channel.assetId === 'CKB' ? 'CKB' : `UDT:${channel.assetId}`
}

function appendChannelDiagnostics(report: ReadinessReport, channels: readonly NormalizedFiberChannel[]) {
  const pendingTlcChannel = channels.find(
    (channel) => channel.state === 'CHANNEL_FORCE_CLOSED_PENDING_TLC'
  )

  if (pendingTlcChannel) {
    report.diagnostics.push(
      createDiagnostic('FORCE_CLOSE_TLC_PENDING', {
        evidence: [
          { label: 'channelId', value: pendingTlcChannel.channelId },
          { label: 'channelState', value: pendingTlcChannel.state }
        ]
      })
    )
    return
  }

  const closedChannel = channels.find((channel) => channel.state === 'CHANNEL_CLOSED')

  if (closedChannel) {
    report.diagnostics.push(
      createDiagnostic('CHANNEL_CLOSED', {
        evidence: [
          { label: 'channelId', value: closedChannel.channelId },
          { label: 'channelState', value: closedChannel.state }
        ]
      })
    )
    return
  }

  const notReadyChannel = channels.find((channel) => channel.state !== 'CHANNEL_READY')

  if (notReadyChannel) {
    report.diagnostics.push(
      createDiagnostic('CHANNEL_NOT_READY', {
        evidence: [
          { label: 'channelId', value: notReadyChannel.channelId },
          { label: 'channelState', value: notReadyChannel.state }
        ]
      })
    )
  }
}

function appendLiquidityDiagnostics(report: ReadinessReport, channels: readonly NormalizedFiberChannel[]) {
  if (channels.length === 0) {
    return
  }

  if (channels.some((channel) => channel.state !== 'CHANNEL_READY')) {
    return
  }

  const invoiceAnalysis = analyzePaymentIntent({
    intent: report.intent,
    nowIso: '1970-01-01T00:00:00.000Z'
  })

  if (!invoiceAnalysis.invoice || invoiceAnalysis.invoice.amount === null) {
    return
  }

  const invoiceAmount = Number(invoiceAnalysis.invoice.amount)

  if (Number.isNaN(invoiceAmount)) {
    return
  }

  const expectedAssetId =
    invoiceAnalysis.invoice.asset.kind === 'CKB'
      ? 'CKB'
      : `UDT:${invoiceAnalysis.invoice.asset.assetId}`

  const matchingAssetChannels = channels.filter(
    (channel) => normalizeChannelAssetId(channel) === expectedAssetId
  )

  if (matchingAssetChannels.length !== channels.length) {
    report.diagnostics.push(
      createDiagnostic('ASSET_MISMATCH', {
        evidence: [
          { label: 'expectedAssetId', value: expectedAssetId },
          {
            label: 'observedAssetIds',
            value: channels.map((channel) => normalizeChannelAssetId(channel)).join(', ')
          }
        ]
      })
    )
  }

  const localBalance = matchingAssetChannels.reduce(
    (sum, channel) => sum + Number(channel.localBalance),
    0
  )
  const remoteBalance = matchingAssetChannels.reduce(
    (sum, channel) => sum + Number(channel.remoteBalance),
    0
  )

  const allLocalBalance = channels.reduce(
    (sum, channel) => sum + Number(channel.localBalance),
    0
  )
  const allRemoteBalance = channels.reduce(
    (sum, channel) => sum + Number(channel.remoteBalance),
    0
  )

  const effectiveLocalBalance = matchingAssetChannels.length > 0 ? localBalance : allLocalBalance
  const effectiveRemoteBalance = matchingAssetChannels.length > 0 ? remoteBalance : allRemoteBalance

  if (effectiveLocalBalance < invoiceAmount) {
    report.diagnostics.push(
      createDiagnostic('INSUFFICIENT_OUTBOUND_LIQUIDITY', {
        evidence: [
          { label: 'invoiceAmount', value: invoiceAmount },
          { label: 'localBalance', value: effectiveLocalBalance }
        ]
      })
    )
  }

  if (effectiveRemoteBalance < invoiceAmount) {
    report.diagnostics.push(
      createDiagnostic('INSUFFICIENT_INBOUND_LIQUIDITY', {
        evidence: [
          { label: 'invoiceAmount', value: invoiceAmount },
          { label: 'remoteBalance', value: effectiveRemoteBalance }
        ]
      })
    )
  }
}

function appendFeeAndExpiryDiagnostics(report: ReadinessReport, input: CheckReadinessInput) {
  if (!input.routeAvailable) {
    return
  }

  if (input.routeFee !== undefined && input.feeCap !== undefined) {
    const routeFee = Number(input.routeFee)
    const feeCap = Number(input.feeCap)

    if (!Number.isNaN(routeFee) && !Number.isNaN(feeCap) && routeFee > feeCap) {
      report.diagnostics.push(
        createDiagnostic('FEE_CAP_TOO_LOW', {
          evidence: [
            { label: 'routeFee', value: routeFee },
            { label: 'feeCap', value: feeCap }
          ]
        })
      )
    }
  }

  if (
    input.routeExpiryDelta !== undefined &&
    input.minSafeExpiryDelta !== undefined &&
    input.routeExpiryDelta < input.minSafeExpiryDelta
  ) {
    report.diagnostics.push(
      createDiagnostic('EXPIRY_UNSAFE', {
        evidence: [
          { label: 'routeExpiryDelta', value: input.routeExpiryDelta },
          { label: 'minSafeExpiryDelta', value: input.minSafeExpiryDelta }
        ]
      })
    )
  }
}

export function checkReadiness(input: CheckReadinessInput): ReadinessReport {
  const report = createEmptyReport(input.intent)
  const targetPeerChannels = findTargetPeerChannels(input.channels, input.targetPeerId)

  if (!hasConnectedPeer(input.peers, input.targetPeerId)) {
    report.diagnostics.push(
      createDiagnostic('PEER_NOT_CONNECTED', {
        evidence: [
          { label: 'targetPeerId', value: input.targetPeerId },
          { label: 'peerConnected', value: false }
        ]
      })
    )
  }

  if (!input.node.graphSynced) {
    report.diagnostics.push(
      createDiagnostic('GRAPH_NOT_SYNCED', {
        evidence: [
          { label: 'graphSynced', value: input.node.graphSynced },
          { label: 'blockHeight', value: input.node.blockHeight }
        ]
      })
    )
  }

  appendChannelDiagnostics(report, targetPeerChannels)
  appendLiquidityDiagnostics(report, targetPeerChannels)
  appendFeeAndExpiryDiagnostics(report, input)

  if (!input.routeAvailable) {
    report.diagnostics.push(
      createDiagnostic('NO_ROUTE', {
        evidence: [
          { label: 'routeAvailable', value: input.routeAvailable },
          { label: 'targetPeerId', value: input.targetPeerId }
        ]
      })
    )
  }

  return report
}
