import type { ConsoleState, PolicyRecord, ProgrammablePayment, ProofRecord } from "./state.js";
export declare const composePaymentProof: (state: ConsoleState, payment: ProgrammablePayment, policy: PolicyRecord) => ProofRecord | null;
