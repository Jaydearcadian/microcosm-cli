import test from "node:test";
import assert from "node:assert/strict";
import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";

import { handleCommand } from "../src/commands.js";
import { parseArgs } from "../src/config.js";
import { createState } from "../src/state.js";

const execFile = promisify(execFileCb);

const run = (command: string, state = createState()) => handleCommand(parseArgs(command.split(/\s+/)), state);

test("top-level command boxes show subcommands", async () => {
  for (const box of ["payment", "policy", "proof", "settlement", "arc", "loop", "adapter"]) {
    const result = await run(box);
    assert.equal(result.exitCode, 0);
    assert.match(result.stdout, new RegExp(`${box} commands`));
  }
});

test("payment create produces a programmable payment", async () => {
  const result = await run("payment create --json");
  assert.equal(result.exitCode, 0);
  const payment = JSON.parse(result.stdout) as { id: string; amount: string; network: string };
  assert.match(payment.id, /^pay_/);
  assert.equal(payment.amount, "20.00");
  assert.equal(payment.network, "arc-testnet");
});

test("policy, proof, and settlement commands compose through one state", async () => {
  const state = createState();

  const payment = await run("payment create --json", state);
  assert.equal(payment.exitCode, 0);

  const policy = await run("policy evaluate --json", state);
  assert.equal(policy.exitCode, 0);
  assert.equal((JSON.parse(policy.stdout) as { evaluation: { status: string } }).evaluation.status, "allowed");

  const proof = await run("proof compose --json", state);
  assert.equal(proof.exitCode, 0);
  assert.equal((JSON.parse(proof.stdout) as { verification: { ok: boolean } }).verification.ok, true);

  const latestProof = await run("proof latest --json", state);
  assert.equal(latestProof.exitCode, 0);
  assert.equal((JSON.parse(latestProof.stdout) as { proof: { status: string } }).proof.status, "policy_approved");

  const settlement = await run("settlement prepare --json", state);
  assert.equal(settlement.exitCode, 0);
  assert.equal((JSON.parse(settlement.stdout) as { status: string; action: string }).status, "prepared");
});

test("denied scenario blocks settlement instruction", async () => {
  const result = await run("loop once --scenario denied --json");
  assert.equal(result.exitCode, 0);
  const runResult = JSON.parse(result.stdout) as { policy: { evaluation: { status: string } }; settlement: { status: string } };
  assert.equal(runResult.policy.evaluation.status, "denied");
  assert.equal(runResult.settlement.status, "blocked");
});

test("loop run respects bounded iterations", async () => {
  const result = await run("loop run --iterations 2 --json");
  assert.equal(result.exitCode, 0);
  const runs = JSON.parse(result.stdout) as unknown[];
  assert.equal(runs.length, 2);
});

test("unsafe flags are rejected", async () => {
  for (const command of [
    "loop once --private-key 0xabc",
    "settlement prepare --submit",
    "arc status --mainnet",
    "payment create --mnemonic words"
  ]) {
    const result = await run(command);
    assert.notEqual(result.exitCode, 0);
    assert.match(result.stderr, /disabled|not read/);
  }
});

test("adapters are visible but disabled", async () => {
  const result = await run("adapter list --json");
  assert.equal(result.exitCode, 0);
  const adapters = JSON.parse(result.stdout) as Array<{ id: string; status: string }>;
  assert.ok(adapters.some((adapter) => adapter.id === "walletconnect"));
  assert.ok(adapters.every((adapter) => adapter.status === "disabled"));
});

test("binary source entry launches help", async () => {
  const { stdout } = await execFile("node_modules/.bin/tsx", ["src/main.ts", "help"], {
    cwd: process.cwd(),
    timeout: 10000
  });
  assert.match(stdout, /Microcosm Programmable Payments Console/);
  assert.match(stdout, /payment/);
  assert.match(stdout, /proof/);
});
