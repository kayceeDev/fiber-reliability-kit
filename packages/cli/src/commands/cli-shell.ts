const supportedCommands = new Set([
  'can-pay',
  'explain-payment',
  'cch',
  'liquidity',
  'node-health'
])

export type CliOptions = {
  json: boolean
  fixture: string | undefined
  rpcUrl: string | undefined
}

export type CliInvocation = {
  command: string
  args: string[]
  options: CliOptions
}

export type CliShell = {
  parse(argv: string[]): CliInvocation
}

function readFlagValue(argv: string[], index: number, flag: '--fixture' | '--rpc-url'): string {
  const value = argv[index + 1]

  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${flag}`)
  }

  return value
}

export function createCliShell(): CliShell {
  return {
    parse(argv) {
      const [command, ...rest] = argv

      if (!command || !supportedCommands.has(command)) {
        throw new Error(`Unknown fiber-doctor command: ${command}`)
      }

      const args: string[] = []
      const options: CliOptions = {
        json: false,
        fixture: undefined,
        rpcUrl: undefined
      }

      for (let index = 0; index < rest.length; index += 1) {
        const token = rest[index]

        if (token === '--json') {
          options.json = true
          continue
        }

        if (token === '--fixture') {
          options.fixture = readFlagValue(rest, index, '--fixture')
          index += 1
          continue
        }

        if (token === '--rpc-url') {
          options.rpcUrl = readFlagValue(rest, index, '--rpc-url')
          index += 1
          continue
        }

        if (token !== undefined) {
          args.push(token)
        }
      }

      return {
        command,
        args,
        options
      }
    }
  }
}
