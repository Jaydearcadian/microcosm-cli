import { emitKeypressEvents } from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { getArcStatus } from "./arc.js";
import { defaultConfig } from "./config.js";
import { createDemoRun, renderDemo } from "./demo.js";
import { assertSafeArgs } from "./safety.js";
import { badge, bold, dim, json, panel, red, yellow } from "./output.js";
export const SCREEN = {
    enter: "\u001b[?1049h",
    exit: "\u001b[?1049l",
    clear: "\u001b[2J\u001b[H",
    hideCursor: "\u001b[?25l",
    showCursor: "\u001b[?25h"
};
const scenarioFromArgs = (args) => {
    const value = args.flags.scenario ?? "allowed";
    if (value === "allowed" || value === "denied" || value === "mixed")
        return value;
    throw new Error("scenario must be allowed, denied, or mixed");
};
const renderControls = (state) => panel("Controls", [
    "1 allowed · 2 denied · 3 mixed · r rerun · a Arc RPC status · j JSON · q/Esc exit",
    `Current ${badge(state.scenario, state.scenario === "denied" ? "warning" : "info")} · ${state.arcStatus}`
]);
const renderSnapshot = (state) => state.showJson ? panel("JSON Snapshot", json(state.run).trim().split("\n").slice(0, 8).concat(["…"])) : "";
export const renderSpaceFrame = (state) => [
    renderDemo(state.run),
    renderControls(state),
    renderSnapshot(state),
    dim("Dedicated alternate screen buffer. Your original terminal returns when this exits."),
    ""
].filter(Boolean).join("\n");
export const startScreen = async (args) => {
    const safetyErrors = assertSafeArgs(args);
    if (safetyErrors.length > 0) {
        output.write(`${red(`error: ${safetyErrors.join("; ")}`)}\n`);
        return 2;
    }
    let scenario = scenarioFromArgs(args);
    const state = {
        scenario,
        run: createDemoRun(scenario),
        showJson: false,
        arcStatus: "Arc RPC status not loaded"
    };
    const rerun = (next = scenario) => {
        scenario = next;
        state.scenario = next;
        state.run = createDemoRun(next);
    };
    const draw = () => output.write(`${SCREEN.clear}${renderSpaceFrame(state)}`);
    if (!input.isTTY || args.flags.once === "true") {
        output.write(args.flags.json === "true" ? json(state.run) : renderSpaceFrame(state));
        return 0;
    }
    let restored = false;
    const restore = () => {
        if (restored)
            return;
        restored = true;
        if (input.isTTY)
            input.setRawMode(false);
        output.write(`${SCREEN.showCursor}${SCREEN.exit}`);
    };
    output.write(`${SCREEN.enter}${SCREEN.hideCursor}`);
    emitKeypressEvents(input);
    input.setRawMode(true);
    input.resume();
    draw();
    return await new Promise((resolve) => {
        const finish = (code) => {
            input.off("keypress", onKey);
            process.off("SIGINT", onSigint);
            process.off("SIGTERM", onSigterm);
            restore();
            resolve(code);
        };
        const onSigint = () => finish(130);
        const onSigterm = () => finish(143);
        const onKey = async (text, key) => {
            if ((key.ctrl && key.name === "c") || key.name === "escape" || text === "q")
                return finish(0);
            if (text === "1")
                rerun("allowed");
            if (text === "2")
                rerun("denied");
            if (text === "3")
                rerun("mixed");
            if (text === "r")
                rerun();
            if (text === "j")
                state.showJson = !state.showJson;
            if (text === "a") {
                state.arcStatus = yellow("loading Arc RPC status…");
                draw();
                try {
                    const status = await getArcStatus(defaultConfig());
                    state.arcStatus = status.ok
                        ? `${badge("ARC OK", "success")} chain ${status.chainId} block ${status.blockNumber}`
                        : `${badge("ARC MISMATCH", "danger")} chain ${status.chainId}`;
                }
                catch (error) {
                    state.arcStatus = `${badge("ARC ERROR", "danger")} ${error instanceof Error ? error.message : "status failed"}`;
                }
            }
            draw();
        };
        process.once("SIGINT", onSigint);
        process.once("SIGTERM", onSigterm);
        input.on("keypress", onKey);
    }).catch((error) => {
        restore();
        output.write(`${bold("mcosm space failed")}: ${error instanceof Error ? error.message : "unknown error"}\n`);
        return 1;
    });
};
