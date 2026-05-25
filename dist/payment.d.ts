import type { EvaluationRequest } from "arc-policy-envelope";
import type { ConsoleState, ProgrammablePayment, Scenario } from "./state.js";
export declare const createPayment: (state: ConsoleState, scenario?: Scenario) => ProgrammablePayment;
export declare const paymentToRequest: (payment: ProgrammablePayment) => EvaluationRequest;
