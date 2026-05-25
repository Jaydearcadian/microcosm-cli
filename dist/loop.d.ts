import type { ConsoleState, LoopRun, Scenario } from "./state.js";
export declare const runOnce: (state: ConsoleState, scenario?: Scenario) => LoopRun;
export declare const runLoop: (state: ConsoleState, iterations: number, scenario?: Scenario) => LoopRun[];
