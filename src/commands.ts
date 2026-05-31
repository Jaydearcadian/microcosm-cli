import { getArcBalance, getArcStatus } from "./arc.js";
import { defaultConfig, type ParsedArgs } from "./config.js";
import { signerAdapters } from "./adapters.js";
import { createPayment } from "./payment.js";
import { evaluatePaymentPolicy } from "./policy.js";
import { composePaymentProof } from "./proof.js";
import { prepareSettlement } from "./settlement.js";
import { reviewRun } from "./review.js";
import { runLoop, runOnce } from "./loop.js";
import { createDemoRun, renderDemo } from "./demo.js";
import { assertSafeArgs } from "./safety.js";
import { createState, latest, type ConsoleState, type Scenario } from "./state.js";
import { fail, json, ok, table, type CommandResult } from "./output.js";

const boxes = ["payment", "policy", "proof", "settlement", "arc", "loop", "adapter"] as const;

export const banner = () => `Microcosm Programmable Payments Console
network: arc-testnet
mode: operator
`;

export const helpText = () => `${banner()}
Command boxes:
  payment      create and inspect programmable payments
  policy       evaluate payment policy
  proof        compose, verify, and inspect payable proofs
  settlement   prepare unsigned settlement instructions
  arc          inspect Arc network state
  loop         automate the programmable payment flow
  adapter      inspect future signer adapters
  demo         open the offline operator-room demo
  space        open isolated full-screen operator room

Other commands:
  status       show current console state
  history      show recent loop runs
  scenario     show or set allowed, denied, or mixed
  reset        clear in-memory state
  help         show this help
  exit         leave the shell
`;

const boxHelp = (box: string) => {
  switch (box) {
    case "payment":
      return "payment commands:\n  payment create\n  payment latest\n  payment list\n  payment get <id>\n  payment status <id>\n";
    case "policy":
      return "policy commands:\n  policy evaluate\n  policy latest\n  policy explain\n";
    case "proof":
      return "proof commands:\n  proof compose\n  proof verify\n  proof latest\n  proof list\n  proof get <id>\n";
    case "settlement":
      return "settlement commands:\n  settlement prepare\n  settlement latest\n  settlement inspect\n";
    case "arc":
      return "arc commands:\n  arc status\n  arc balance <address>\n  arc rpc-info\n";
    case "loop":
      return "loop commands:\n  loop once\n  loop run --iterations <n>\n  loop status\n";
    case "adapter":
      return "adapter commands:\n  adapter list\n  adapter status\n";
    default:
      return helpText();
  }
};

const scenarioFromArgs = (args: ParsedArgs, state: ConsoleState): Scenario => {
  const value = args.flags.scenario ?? state.scenario;
  if (value === "allowed" || value === "denied" || value === "mixed") return value;
  throw new Error("scenario must be allowed, denied, or mixed");
};

const printable = (value: unknown, useJson: boolean): string =>
  useJson ? json(value) : `${JSON.stringify(value, null, 2)}\n`;

const requirePayment = (state: ConsoleState) => latest(state.payments) ?? createPayment(state);
const requirePolicy = (state: ConsoleState) => latest(state.policies) ?? evaluatePaymentPolicy(state, requirePayment(state));
const requireProof = (state: ConsoleState) => latest(state.proofs) ?? composePaymentProof(state, requirePayment(state), requirePolicy(state));

export const handleCommand = async (
  args: ParsedArgs,
  state: ConsoleState = createState()
): Promise<CommandResult> => {
  const safetyErrors = assertSafeArgs(args);
  if (safetyErrors.length > 0) return fail(`error: ${safetyErrors.join("; ")}\n`, 2);

  const { group, subcommand, rest } = args;
  if (!group || group === "help") return ok(helpText());
  if (boxes.includes(group as never) && !subcommand) return ok(boxHelp(group));

  try {
    if (group === "status") {
      const status = {
        network: "arc-testnet",
        mode: "operator",
        scenario: state.scenario,
        payments: state.payments.length,
        proofs: state.proofs.length,
        settlements: state.settlements.length,
        runs: state.runs.length,
        latestRun: latest(state.runs)?.id ?? null
      };
      return ok(args.json ? json(status) : table(Object.entries(status).map(([key, value]) => [key, String(value)])));
    }

    if (group === "history") return ok(printable(state.runs, args.json));

    if (group === "reset") {
      Object.assign(state, createState());
      return ok("state reset\n");
    }

    if (group === "scenario") {
      const value = subcommand;
      if (!value) return ok(`scenario: ${state.scenario}\n`);
      if (value !== "allowed" && value !== "denied" && value !== "mixed") return fail("error: scenario must be allowed, denied, or mixed\n", 2);
      state.scenario = value;
      return ok(`scenario set to ${value}\n`);
    }

    if (group === "payment") {
      if (subcommand === "create") {
        const payment = createPayment(state, scenarioFromArgs(args, state));
        return ok(printable(payment, args.json));
      }
      if (subcommand === "latest") return ok(printable(latest(state.payments) ?? null, args.json));
      if (subcommand === "list") return ok(printable(state.payments, args.json));
      if (subcommand === "get" || subcommand === "status") {
        const id = rest[0];
        const payment = state.payments.find((entry) => entry.id === id);
        return payment ? ok(printable(payment, args.json)) : fail("error: payment not found\n", 1);
      }
    }

    if (group === "policy") {
      if (subcommand === "evaluate") {
        const payment = requirePayment(state);
        const policy = evaluatePaymentPolicy(state, payment);
        return ok(printable(policy, args.json));
      }
      if (subcommand === "latest") return ok(printable(latest(state.policies) ?? null, args.json));
      if (subcommand === "explain") {
        const policy = latest(state.policies) ?? requirePolicy(state);
        return ok(`${policy.evaluation.status}: ${policy.evaluation.reasons.join("; ")}\n`);
      }
    }

    if (group === "proof") {
      if (subcommand === "compose") {
        const payment = requirePayment(state);
        const policy = requirePolicy(state);
        const proof = composePaymentProof(state, payment, policy);
        return ok(printable(proof, args.json));
      }
      if (subcommand === "verify") {
        const proof = requireProof(state);
        return ok(printable(proof?.verification ?? null, args.json));
      }
      if (subcommand === "latest") return ok(printable(latest(state.proofs) ?? null, args.json));
      if (subcommand === "list") return ok(printable(state.proofs, args.json));
      if (subcommand === "get") {
        const id = rest[0];
        const proof = state.proofs.find((entry) => entry.proof.id === id);
        return proof ? ok(printable(proof, args.json)) : fail("error: proof not found\n", 1);
      }
    }

    if (group === "settlement") {
      if (subcommand === "prepare") {
        const payment = requirePayment(state);
        const policy = requirePolicy(state);
        const proof = requireProof(state);
        const review = reviewRun(policy, proof);
        const settlement = prepareSettlement(state, payment, proof, review);
        return ok(printable(settlement, args.json));
      }
      if (subcommand === "latest" || subcommand === "inspect") return ok(printable(latest(state.settlements) ?? null, args.json));
    }

    if (group === "loop") {
      if (subcommand === "once") return ok(printable(runOnce(state, scenarioFromArgs(args, state)), args.json));
      if (subcommand === "run") {
        const iterations = Number(args.flags.iterations ?? "0");
        if (!Number.isInteger(iterations) || iterations < 1) return fail("error: loop run requires --iterations <n>\n", 2);
        return ok(printable(runLoop(state, iterations, scenarioFromArgs(args, state)), args.json));
      }
      if (subcommand === "status") return ok(printable({ runs: state.runs.length, latestRun: latest(state.runs)?.id ?? null }, args.json));
    }

    if (group === "adapter") {
      if (subcommand === "list" || subcommand === "status") return ok(printable(signerAdapters(), args.json));
    }

    if (group === "demo") {
      const run = createDemoRun(scenarioFromArgs(args, state));
      return ok(args.json ? json(run) : `${renderDemo(run)}\n`);
    }

    if (group === "arc") {
      const config = defaultConfig();
      if (subcommand === "rpc-info") return ok(printable({ network: config.network, rpcUrl: config.rpcUrl.replace(/\/\/.*@/, "//<redacted>@") }, args.json));
      if (subcommand === "status") return ok(printable(await getArcStatus(config), args.json));
      if (subcommand === "balance") {
        const address = rest[0];
        if (!address || !address.startsWith("0x")) return fail("error: arc balance requires an address\n", 2);
        return ok(printable(await getArcBalance(config, address as `0x${string}`), args.json));
      }
    }

    return fail(`error: unknown command. Run ${group && boxes.includes(group as never) ? group : "help"} for options.\n`, 1);
  } catch (error) {
    return fail(`error: ${error instanceof Error ? error.message : "command failed"}\n`, 1);
  }
};
