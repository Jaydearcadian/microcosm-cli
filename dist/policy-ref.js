export const policyRefFromEvaluation = (evaluation, request, envelope) => {
    if (evaluation.status !== "allowed")
        return null;
    const allowed = evaluation;
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
