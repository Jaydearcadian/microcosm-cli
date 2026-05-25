import type { EvaluationRequest, PolicyEnvelope, PolicyEvaluation } from "arc-policy-envelope";
import type { PolicyRef } from "arc-proof-of-payable";
export declare const policyRefFromEvaluation: (evaluation: PolicyEvaluation, request: EvaluationRequest, envelope: PolicyEnvelope) => PolicyRef | null;
