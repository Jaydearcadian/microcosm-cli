import { assessFinanceability, composeProofOfPayable, verifyProof } from "arc-proof-of-payable";
import type { ConsoleState, PolicyRecord, ProgrammablePayment, ProofRecord } from "./state.js";

export const composePaymentProof = (
  state: ConsoleState,
  payment: ProgrammablePayment,
  policy: PolicyRecord
): ProofRecord | null => {
  const intent = {
    intentId: policy.request.id,
    intentHash: policy.evaluation.requestHash
  };
  const base = {
    id: `pop_${payment.id}`,
    payer: { kind: "organization" as const, id: payment.payerId },
    payee: { kind: payment.payee.kind, id: payment.payee.id },
    terms: {
      amount: payment.amount,
      asset: payment.asset,
      network: payment.network,
      reason: payment.reason
    },
    intent,
    createdAt: policy.evaluation.evaluatedAt,
    updatedAt: policy.evaluation.evaluatedAt
  };

  const proof = policy.policyRef
    ? composeProofOfPayable({ ...base, status: "policy_approved", policy: policy.policyRef })
    : composeProofOfPayable({
      ...base,
      status: "rejected",
      rejection: {
        reason: policy.evaluation.reasons.join("; "),
        rejectionHash: policy.evaluation.status === "denied" ? policy.evaluation.denialHash : policy.evaluation.requestHash
      }
    });

  payment.status = "proof_composed";
  const record = {
    proof,
    verification: verifyProof(proof),
    financeability: assessFinanceability(proof)
  };
  state.proofs.push(record);
  return record;
};
