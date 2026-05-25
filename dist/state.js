export const createState = () => ({
    scenario: "allowed",
    runCount: 0,
    payments: [],
    policies: [],
    proofs: [],
    settlements: [],
    runs: []
});
export const latest = (items) => items[items.length - 1];
