import type { McosmConfig } from "./config.js";
export declare const getArcStatus: (config: McosmConfig) => Promise<{
    network: "arc-testnet";
    expectedChainId: 5042002;
    chainId: number;
    ok: boolean;
    blockNumber: string;
}>;
export declare const getArcBalance: (config: McosmConfig, address: `0x${string}`) => Promise<{
    address: `0x${string}`;
    network: "arc-testnet";
    nativeUsdcGas: string;
    usdc: string;
    eurc: string;
}>;
