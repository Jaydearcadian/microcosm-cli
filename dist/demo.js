import { signerAdapters } from "./adapters.js";
import { runOnce } from "./loop.js";
import { badge, bold, cyan, dim, green, panel, red, truncate, yellow } from "./output.js";
import { createState } from "./state.js";
const rail = (run) => {
    const policy = run.policy.evaluation.status === "allowed" ? green("policy") : red("policy");
    const proof = run.proof?.verification.ok ? green("proof") : red("proof");
    const review = run.review.status === "approved" ? green("approved") : red("rejected");
    const settlement = run.settlement.status === "prepared" ? green("settlement") : yellow("blocked");
    return `${cyan("payment")} ─▶ ${policy} ─▶ ${proof} ─▶ ${review} ─▶ ${settlement}`;
};
const reasons = (run) => run.policy.evaluation.reasons.length > 0 ? run.policy.evaluation.reasons.join("; ") : "all envelope checks passed";
const targetLabel = (target) => target.kind === "recipient" ? `recipient:${target.recipientId}` : `venue:${target.venueId}`;
export const createDemoRun = (scenario) => runOnce(createState(), scenario);
export const renderDemo = (run) => {
    const settlementTone = run.settlement.status === "prepared" ? "success" : "warning";
    const proofHash = run.proof?.verification.proofHash ?? "not-issued";
    const approvalHash = run.policy.policyRef?.approvalHash ?? "blocked-before-approval";
    const adapters = signerAdapters().map((adapter) => `${adapter.label}: ${adapter.status}`);
    return [
        bold("MICROCOSM OPERATOR ROOM"),
        dim("Arc-native programmable payments console · offline demo mode · no signing"),
        "",
        panel("Flow", [
            rail(run),
            `Run ${run.id} · Scenario ${badge(run.scenario, run.scenario === "denied" ? "warning" : "info")} · Network ${cyan(run.payment.network)}`
        ]),
        panel("Payment Intent", [
            `Payment ${bold(run.payment.id)} sends ${green(`${run.payment.amount} ${run.payment.asset}`)} to ${run.payment.payee.id}`,
            `Reason ${run.payment.reason}`,
            `Target ${targetLabel(run.payment.target)}`
        ]),
        panel("Policy Envelope", [
            `Verdict ${run.policy.evaluation.status === "allowed" ? badge("ALLOWED", "success") : badge("DENIED", "danger")}`,
            `Policy ${truncate(run.policy.evaluation.policyHash)} · Request ${truncate(run.policy.evaluation.requestHash)}`,
            `Approval ${truncate(approvalHash)}`,
            `Reason ${reasons(run)}`
        ]),
        panel("Proof + Review", [
            `Proof ${truncate(proofHash)} · Verification ${run.proof?.verification.ok ? badge("OK", "success") : badge("FAILED", "danger")}`,
            `Financeability ${run.proof?.financeability.financeable ? badge("ELIGIBLE", "success") : badge("INELIGIBLE", "warning")}`,
            `Review board ${badge(run.review.status.toUpperCase(), run.review.status === "approved" ? "success" : "warning")}`,
            `Approvals ${run.review.approvals.join(", ") || "none"} · Rejections ${run.review.rejections.join(", ") || "none"}`
        ]),
        panel("Settlement Boundary", [
            `Instruction ${badge(run.settlement.status.toUpperCase(), settlementTone)} · Action ${run.settlement.action}`,
            `Warnings ${run.settlement.warnings.join("; ")}`,
            `Wallet adapters ${adapters.slice(0, 2).join(" | ")}`,
            `Next adapter ${adapters[2]}`
        ]),
        panel("Submission Notes", [
            `${green("ready")}: policy-gated payment, payable proof, review verdict, settlement preview`,
            `${yellow("next")}: connect WalletConnect/Circle wallets after this offline demo release`,
            `${red("guardrails")}: no private keys · no submit · no broadcast · no mainnet`
        ]),
        ""
    ].join("\n");
};
