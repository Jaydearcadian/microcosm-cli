import type { ConsoleState, PolicyRecord, ProgrammablePayment } from "./state.js";
export declare const evaluatePaymentPolicy: (state: ConsoleState, payment: ProgrammablePayment) => PolicyRecord;
