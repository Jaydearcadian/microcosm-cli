import type { AllowedEvaluation, EvaluationRequest, PolicyEnvelope, PolicyEvaluation } from "arc-policy-envelope";
import type { PolicyRef } from "arc-proof-of-payable";

export const policyRefFromEvaluation = (
  evaluation: PolicyEvaluation,
  request: EvaluationRequest,
  envelope: PolicyEnvelope
): PolicyRef | null => {
  if (evaluation.status !== "allowed") return null;
  const allowed = evaluation as AllowedEvaluation;
  return {
    envelopeId: allowed.envelopeId,
    policyHash: allowed.policyHash,
    approvalHash: allowed.approvalHash,
    approval: {
      version: allowed.version,
      status: "allowed",
      requestId: allowed.requestId,
      requestHash: allowed.requestHash,
      evaluatedAt: allowed.evaluatedAt,
      reasons: allowed.reasons,
      request,
      envelope
    }
  };
};
