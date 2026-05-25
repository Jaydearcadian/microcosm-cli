import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { parseArgs } from "./config.js";
import { banner, handleCommand, helpText } from "./commands.js";
import { createDemoRun, renderDemo } from "./demo.js";
import { createState } from "./state.js";
export const startShell = async () => {
    const state = createState();
    const rl = createInterface({ input, output, prompt: "mcosm> " });
    output.write(`${banner()}\n${renderDemo(createDemoRun("allowed"))}\nType demo, demo --scenario denied, help, or exit.\n`);
    try {
        for (;;) {
            const line = (await rl.question("mcosm> ")).trim();
            if (!line)
                continue;
            if (line === "exit" || line === "quit")
                break;
            const args = parseArgs(line.split(/\s+/));
            const result = await handleCommand(args, state);
            if (result.stdout)
                output.write(result.stdout);
            if (result.stderr)
                output.write(result.stderr);
        }
    }
    finally {
        rl.close();
    }
    return 0;
};
export const shellHelp = helpText;
