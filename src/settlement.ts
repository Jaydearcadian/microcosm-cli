import type { ConsoleState, ProgrammablePayment, ProofRecord, ReviewVerdict, SettlementInstruction } from "./state.js";

export const prepareSettlement = (
  state: ConsoleState,
  payment: ProgrammablePayment,
  proof: ProofRecord | null,
  review: ReviewVerdict
): SettlementInstruction => {
  const proofHash = proof?.verification.proofHash;
  const approved = review.status === "approved" && proof?.proof.status === "policy_approved";
  const instruction: SettlementInstruction = {
    id: `settlement_${payment.id}`,
    status: approved ? "prepared" : "blocked",
    network: payment.network,
    asset: payment.asset,
    amount: payment.amount,
    payerId: payment.payerId,
    payeeId: payment.payee.id,
    reason: payment.reason,
    proofId: proof?.proof.id,
    proofHash,
    action: "prepare_only",
    warnings: approved
      ? ["Unsigned instruction only. Signing and submission are disabled in v0."]
      : ["Settlement blocked by policy, proof, or review verdict."]
  };
  if (approved) payment.status = "settlement_prepared";
  state.settlements.push(instruction);
  return instruction;
};
