import { parseArgs } from "./config.js";
import { handleCommand } from "./commands.js";
import { startShell } from "./shell.js";
import { createState } from "./state.js";

export const main = async (argv = process.argv.slice(2)): Promise<number> => {
  if (argv.length === 0 && process.stdin.isTTY) return startShell();

  const state = createState();
  const result = await handleCommand(parseArgs(argv), state);
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return result.exitCode;
};

if (process.argv[1]?.endsWith("/src/main.ts") || import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = await main();
}
