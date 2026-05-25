export const defaultConfig = () => ({
    network: "arc-testnet",
    rpcUrl: process.env.ARC_TESTNET_RPC_URL ?? "https://rpc.testnet.arc.network"
});
export const parseArgs = (argv) => {
    const positional = [];
    const flags = {};
    for (let i = 0; i < argv.length;) {
        const arg = argv[i];
        if (arg.startsWith("--")) {
            const key = arg.slice(2);
            const next = argv[i + 1];
            if (next && !next.startsWith("--")) {
                flags[key] = next;
                i += 2;
            }
            else {
                flags[key] = "true";
                i += 1;
            }
        }
        else {
            positional.push(arg);
            i += 1;
        }
    }
    const [group, subcommand, ...rest] = positional;
    return { group, subcommand, rest, flags, json: flags.json === "true" };
};
