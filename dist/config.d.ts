export type ParsedArgs = {
    group?: string;
    subcommand?: string;
    rest: string[];
    flags: Record<string, string>;
    json: boolean;
};
export type McosmConfig = {
    network: "arc-testnet";
    rpcUrl: string;
};
export declare const defaultConfig: () => McosmConfig;
export declare const parseArgs: (argv: string[]) => ParsedArgs;
