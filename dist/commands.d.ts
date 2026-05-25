import { type ParsedArgs } from "./config.js";
import { type ConsoleState } from "./state.js";
import { type CommandResult } from "./output.js";
export declare const banner: () => string;
export declare const helpText: () => string;
export declare const handleCommand: (args: ParsedArgs, state?: ConsoleState) => Promise<CommandResult>;
