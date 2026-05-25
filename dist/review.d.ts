import type { PolicyRecord, ProofRecord, ReviewVerdict } from "./state.js";
export declare const reviewRun: (policy: PolicyRecord, proof: ProofRecord | null) => ReviewVerdict;
