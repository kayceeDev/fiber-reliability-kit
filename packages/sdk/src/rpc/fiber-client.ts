import {
  normalizeFiberChannels,
  normalizeFiberNodeInfo,
  normalizeFiberPeers
} from './normalizers/fiber-normalizers.js'
import type {
  FiberChannelRpc,
  FiberNodeInfoRpc,
  FiberPeerRpc,
  FiberRpcTransport
} from './fiber-types.js'

export type FiberRpcClient = {
  getNodeInfo(): Promise<ReturnType<typeof normalizeFiberNodeInfo>>
  listPeers(): Promise<ReturnType<typeof normalizeFiberPeers>>
  listChannels(): Promise<ReturnType<typeof normalizeFiberChannels>>
}

export function createFiberRpcClient({ send }: FiberRpcTransport): FiberRpcClient {
  return {
    async getNodeInfo() {
      const response = (await send('node_info', undefined)) as FiberNodeInfoRpc

      return normalizeFiberNodeInfo(response)
    },
    async listPeers() {
      const response = (await send('list_peers', undefined)) as FiberPeerRpc[]

      return normalizeFiberPeers(response)
    },
    async listChannels() {
      const response = (await send('list_channels', undefined)) as FiberChannelRpc[]

      return normalizeFiberChannels(response)
    }
  }
}
