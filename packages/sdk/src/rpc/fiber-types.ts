import type { FiberNetwork } from '../domains/payment-intent/types.js'

export type FiberJsonRpcMethod = 'node_info' | 'list_peers' | 'list_channels' | 'parse_invoice'

export type FiberRpcTransport = {
  send(method: FiberJsonRpcMethod, params?: unknown): Promise<unknown>
}

export type FiberNodeInfoRpc = {
  node_name: string
  peer_id: string
  network: string
  synced_to_graph: boolean
  block_height: string
}

export type FiberPeerRpc = {
  peer_id: string
  connected: boolean
}

export type FiberChannelRpc = {
  channel_id: string
  state: string
  local_balance: string
  remote_balance: string
  asset_id: string
  peer_id: string
}

export type NormalizedFiberNodeInfo = {
  nodeName: string
  peerId: string
  network: FiberNetwork
  graphSynced: boolean
  blockHeight: string
}

export type NormalizedFiberPeer = {
  peerId: string
  connected: boolean
}

export type NormalizedFiberChannel = {
  channelId: string
  state: string
  localBalance: string
  remoteBalance: string
  assetId: string
  peerId: string
}
