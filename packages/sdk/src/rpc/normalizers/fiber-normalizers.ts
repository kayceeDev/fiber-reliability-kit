import type { FiberNetwork } from '../../domains/payment-intent/types.js'
import type {
  FiberChannelRpc,
  FiberNodeInfoRpc,
  FiberPeerRpc,
  NormalizedFiberChannel,
  NormalizedFiberNodeInfo,
  NormalizedFiberPeer
} from '../fiber-types.js'

function normalizeFiberNetwork(network: string): FiberNetwork {
  if (network === 'mainnet' || network === 'testnet' || network === 'devnet') {
    return network
  }

  throw new Error(`Unsupported Fiber network in node_info response: ${network}`)
}

export function normalizeFiberNodeInfo(nodeInfo: FiberNodeInfoRpc): NormalizedFiberNodeInfo {
  return {
    nodeName: nodeInfo.node_name,
    peerId: nodeInfo.peer_id,
    network: normalizeFiberNetwork(nodeInfo.network),
    graphSynced: nodeInfo.synced_to_graph,
    blockHeight: nodeInfo.block_height
  }
}

export function normalizeFiberPeers(peers: readonly FiberPeerRpc[]): NormalizedFiberPeer[] {
  return peers.map((peer) => ({
    peerId: peer.peer_id,
    connected: peer.connected
  }))
}

export function normalizeFiberChannels(
  channels: readonly FiberChannelRpc[]
): NormalizedFiberChannel[] {
  return channels.map((channel) => ({
    channelId: channel.channel_id,
    state: channel.state,
    localBalance: channel.local_balance,
    remoteBalance: channel.remote_balance,
    assetId: channel.asset_id,
    peerId: channel.peer_id
  }))
}
