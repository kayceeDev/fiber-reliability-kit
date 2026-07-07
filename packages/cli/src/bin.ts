#!/usr/bin/env -S node --import tsx

import { executeCliCommandDetailed } from './commands/execute-cli-command.js'

async function main() {
  try {
    const result = await executeCliCommandDetailed(process.argv.slice(2))

    if (result.output) {
      process.stdout.write(`${result.output}\n`)
    }

    process.exitCode = result.exitCode
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`${message}\n`)
    process.exitCode = 1
  }
}

void main()
