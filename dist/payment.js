import { allowedRequest, deniedRequest, hashRequest } from "arc-policy-envelope";
const requestForScenario = (scenario, runCount) => {
    if (scenario === "denied")
        return deniedRequest;
    if (scenario === "mixed")
        return runCount % 2 === 0 ? allowedRequest : deniedRequest;
    return allowedRequest;
};
export const createPayment = (state, scenario = state.scenario) => {
    const request = requestForScenario(scenario, state.runCount);
    const requestHash = hashRequest(request);
    const payment = {
        id: `pay_${requestHash.slice(2, 14)}_${state.payments.length + 1}`,
        payerId: request.payerId,
        payee: { kind: "agent", id: request.actorId },
        amount: request.amount,
        asset: request.asset,
        network: "arc-testnet",
        reason: request.reason,
        target: request.target,
        createdAt: request.requestedAt,
        status: "created"
    };
    state.payments.push(payment);
    return payment;
};
export const paymentToRequest = (payment) => ({
    version: "request.v1",
    id: payment.id,
    payerId: payment.payerId,
    actorId: payment.payee.id,
    asset: payment.asset,
    network: payment.network,
    amount: payment.amount,
    reason: payment.reason,
    target: payment.target,
    requestedAt: payment.createdAt,
    spentInPeriod: "10.00"
});
