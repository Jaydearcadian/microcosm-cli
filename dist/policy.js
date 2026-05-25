import { demoEnvelope, evaluateEnvelope } from "arc-policy-envelope";
import { paymentToRequest } from "./payment.js";
import { policyRefFromEvaluation } from "./policy-ref.js";
export const evaluatePaymentPolicy = (state, payment) => {
    const request = paymentToRequest(payment);
    const evaluation = evaluateEnvelope(demoEnvelope, request, payment.createdAt);
    const policyRef = policyRefFromEvaluation(evaluation, request, demoEnvelope);
    payment.status = evaluation.status === "allowed" ? "policy_allowed" : "policy_denied";
    const record = { envelope: demoEnvelope, request, evaluation, policyRef };
    state.policies.push(record);
    return record;
};
