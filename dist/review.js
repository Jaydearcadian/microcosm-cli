export const reviewRun = (policy, proof) => {
    const approvals = [];
    const rejections = [];
    if (policy.evaluation.status === "allowed")
        approvals.push("policy");
    else
        rejections.push("policy");
    if (proof?.verification.ok)
        approvals.push("proof");
    else
        rejections.push("proof");
    if (policy.policyRef && proof?.proof.status === "policy_approved")
        approvals.push("settlement-prep");
    else
        rejections.push("settlement-prep");
    return {
        status: rejections.length === 0 ? "approved" : "rejected",
        approvals,
        rejections
    };
};
