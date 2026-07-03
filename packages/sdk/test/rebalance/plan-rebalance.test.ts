import { describe, expect, it } from 'vitest'

import { planRebalance } from '../../src/index.js'

describe('planRebalance', () => {
  it('builds a dry-run rebalance plan for the requested target peer and asset', () => {
    const report = planRebalance({
      targetPeerId: 'peer-1',
      assetId: 'CKB',
      desiredLocalBalance: '1200',
      channels: [
        {
          channelId: 'channel-1',
          state: 'CHANNEL_READY',
          localBalance: '600',
          remoteBalance: '1400',
          assetId: 'CKB',
          peerId: 'peer-1'
        }
      ],
      projectedFee: '50',
      feeBudget: '100'
    })

    expect(report.targetPeerId).toBe('peer-1')
    expect(report.assetId).toBe('CKB')
    expect(report.summary).toContain('rebalance')
    expect(report.projectedDelta).toBe('600')
    expect(report.diagnostics).toEqual([])
  })

  it('filters to the requested asset before computing liquidity delta', () => {
    const report = planRebalance({
      targetPeerId: 'peer-1',
      assetId: '0xudt-asset',
      desiredLocalBalance: '500',
      channels: [
        {
          channelId: 'channel-1',
          state: 'CHANNEL_READY',
          localBalance: '600',
          remoteBalance: '1400',
          assetId: 'CKB',
          peerId: 'peer-1'
        },
        {
          channelId: 'channel-2',
          state: 'CHANNEL_READY',
          localBalance: '100',
          remoteBalance: '900',
          assetId: '0xudt-asset',
          peerId: 'peer-1'
        }
      ],
      projectedFee: '20',
      feeBudget: '100'
    })

    expect(report.projectedDelta).toBe('400')
  })

  it('emits FEE_CAP_TOO_LOW when the projected rebalance fee exceeds the fee budget', () => {
    const report = planRebalance({
      targetPeerId: 'peer-1',
      assetId: 'CKB',
      desiredLocalBalance: '1200',
      channels: [
        {
          channelId: 'channel-1',
          state: 'CHANNEL_READY',
          localBalance: '600',
          remoteBalance: '1400',
          assetId: 'CKB',
          peerId: 'peer-1'
        }
      ],
      projectedFee: '150',
      feeBudget: '100'
    })

    expect(report.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      'FEE_CAP_TOO_LOW'
    ])
  })

  it('returns a zero delta when the target already has the desired local balance', () => {
    const report = planRebalance({
      targetPeerId: 'peer-1',
      assetId: 'CKB',
      desiredLocalBalance: '600',
      channels: [
        {
          channelId: 'channel-1',
          state: 'CHANNEL_READY',
          localBalance: '600',
          remoteBalance: '1400',
          assetId: 'CKB',
          peerId: 'peer-1'
        }
      ],
      projectedFee: '20',
      feeBudget: '100'
    })

    expect(report.projectedDelta).toBe('0')
    expect(report.summary).toContain('already')
  })

  it('handles missing target channels by planning the full desired balance delta', () => {
    const report = planRebalance({
      targetPeerId: 'peer-missing',
      assetId: 'CKB',
      desiredLocalBalance: '900',
      channels: [
        {
          channelId: 'channel-1',
          state: 'CHANNEL_READY',
          localBalance: '600',
          remoteBalance: '1400',
          assetId: 'CKB',
          peerId: 'peer-1'
        }
      ],
      projectedFee: '20',
      feeBudget: '100'
    })

    expect(report.projectedDelta).toBe('900')
  })
})
