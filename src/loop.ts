import type { ConsoleState, LoopRun, Scenario } from "./state.js";
import { createPayment } from "./payment.js";
import { evaluatePaymentPolicy } from "./policy.js";
import { composePaymentProof } from "./proof.js";
import { reviewRun } from "./review.js";
import { prepareSettlement } from "./settlement.js";

export const runOnce = (state: ConsoleState, scenario: Scenario = state.scenario): LoopRun => {
  const payment = createPayment(state, scenario);
  const policy = evaluatePaymentPolicy(state, payment);
  const proof = composePaymentProof(state, payment, policy);
  const review = reviewRun(policy, proof);
  const settlement = prepareSettlement(state, payment, proof, review);
  state.runCount += 1;
  const run: LoopRun = {
    id: `run_${state.runCount}`,
    scenario,
    payment,
    policy,
    proof,
    review,
    settlement
  };
  state.runs.push(run);
  return run;
};

export const runLoop = (state: ConsoleState, iterations: number, scenario: Scenario = state.scenario): LoopRun[] => {
  const runs: LoopRun[] = [];
  for (let i = 0; i < iterations; i += 1) {
    runs.push(runOnce(state, scenario));
  }
  return runs;
};
