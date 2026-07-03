export type LocalRpcModeConfig = {
  enabled: boolean
  rpcUrl: string | null
  mode: 'fixture-only' | 'local-rpc'
  label: string
}

export type CreateLocalRpcModeInput = {
  enableLocalRpc?: boolean
  rpcUrl?: string
}

function isAllowedLocalRpcUrl(rpcUrl: string): boolean {
  return rpcUrl.startsWith('http://127.0.0.1:') || rpcUrl.startsWith('http://localhost:')
}

export function createLocalRpcModeConfig(
  input: CreateLocalRpcModeInput
): LocalRpcModeConfig {
  if (!input.enableLocalRpc) {
    return {
      enabled: false,
      rpcUrl: null,
      mode: 'fixture-only',
      label: 'Mocked fixture data only'
    }
  }

  if (!input.rpcUrl) {
    throw new Error('Local RPC mode requires an rpcUrl.')
  }

  if (!isAllowedLocalRpcUrl(input.rpcUrl)) {
    throw new Error('Local RPC mode only supports localhost or 127.0.0.1 URLs.')
  }

  return {
    enabled: true,
    rpcUrl: input.rpcUrl,
    mode: 'local-rpc',
    label: 'Local operator-provided RPC'
  }
}
