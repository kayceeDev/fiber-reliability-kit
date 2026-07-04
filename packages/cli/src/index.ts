export const cliPackageName = 'fiber-doctor'

export { createCliShell, type CliInvocation, type CliOptions, type CliShell } from './commands/cli-shell.js'
export {
  executeCliCommand,
  executeCliCommandDetailed,
  type CliExecutionResult
} from './commands/execute-cli-command.js'
