import type { ConsoleState, ProgrammablePayment, ProofRecord, ReviewVerdict, SettlementInstruction } from "./state.js";
export declare const prepareSettlement: (state: ConsoleState, payment: ProgrammablePayment, proof: ProofRecord | null, review: ReviewVerdict) => SettlementInstruction;
