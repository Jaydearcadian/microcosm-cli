import { createPayment } from "./payment.js";
import { evaluatePaymentPolicy } from "./policy.js";
import { composePaymentProof } from "./proof.js";
import { reviewRun } from "./review.js";
import { prepareSettlement } from "./settlement.js";
export const runOnce = (state, scenario = state.scenario) => {
    const payment = createPayment(state, scenario);
    const policy = evaluatePaymentPolicy(state, payment);
    const proof = composePaymentProof(state, payment, policy);
    const review = reviewRun(policy, proof);
    const settlement = prepareSettlement(state, payment, proof, review);
    state.runCount += 1;
    const run = {
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
export const runLoop = (state, iterations, scenario = state.scenario) => {
    const runs = [];
    for (let i = 0; i < iterations; i += 1) {
        runs.push(runOnce(state, scenario));
    }
    return runs;
};
