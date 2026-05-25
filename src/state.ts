import type { EvaluationRequest, PolicyEnvelope, PolicyEvaluation } from "arc-policy-envelope";
import type { FinanceabilityResult, PolicyRef, ProofOfPayable, VerificationResult } from "arc-proof-of-payable";

export type Scenario = "allowed" | "denied" | "mixed";

export type ProgrammablePayment = {
  id: string;
  payerId: string;
  payee: { kind: "agent" | "recipient" | "wallet"; id: string };
  amount: string;
  asset: "USDC" | "EURC";
  network: "arc-testnet";
  reason: string;
  target: EvaluationRequest["target"];
  createdAt: string;
  status: "created" | "policy_allowed" | "policy_denied" | "proof_composed" | "settlement_prepared";
};

export type PolicyRecord = {
  envelope: PolicyEnvelope;
  request: EvaluationRequest;
  evaluation: PolicyEvaluation;
  policyRef: PolicyRef | null;
};

export type ProofRecord = {
  proof: ProofOfPayable;
  verification: VerificationResult;
  financeability: FinanceabilityResult;
};

export type SettlementInstruction = {
  id: string;
  status: "prepared" | "blocked";
  network: "arc-testnet";
  asset: "USDC" | "EURC";
  amount: string;
  payerId: string;
  payeeId: string;
  reason: string;
  proofId?: string;
  proofHash?: string;
  action: "prepare_only";
  warnings: string[];
};

export type ReviewVerdict = {
  status: "approved" | "rejected";
  approvals: string[];
  rejections: string[];
};

export type LoopRun = {
  id: string;
  scenario: Scenario;
  payment: ProgrammablePayment;
  policy: PolicyRecord;
  proof: ProofRecord | null;
  review: ReviewVerdict;
  settlement: SettlementInstruction;
};

export type ConsoleState = {
  scenario: Scenario;
  runCount: number;
  payments: ProgrammablePayment[];
  policies: PolicyRecord[];
  proofs: ProofRecord[];
  settlements: SettlementInstruction[];
  runs: LoopRun[];
};

export const createState = (): ConsoleState => ({
  scenario: "allowed",
  runCount: 0,
  payments: [],
  policies: [],
  proofs: [],
  settlements: [],
  runs: []
});

export const latest = <T>(items: T[]): T | undefined => items[items.length - 1];
