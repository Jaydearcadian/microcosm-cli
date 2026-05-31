import { type ParsedArgs } from "./config.js";
import type { LoopRun, Scenario } from "./state.js";
export declare const SCREEN: {
    readonly enter: "\u001B[?1049h";
    readonly exit: "\u001B[?1049l";
    readonly clear: "\u001B[2J\u001B[H";
    readonly hideCursor: "\u001B[?25l";
    readonly showCursor: "\u001B[?25h";
};
type SpaceState = {
    scenario: Scenario;
    run: LoopRun;
    showJson: boolean;
    arcStatus: string;
};
export declare const renderSpaceFrame: (state: SpaceState) => string;
export declare const startScreen: (args: ParsedArgs) => Promise<number>;
export {};
