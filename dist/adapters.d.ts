export type SignerAdapterStatus = {
    id: "walletconnect" | "circle-wallets" | "local-encrypted-key";
    label: string;
    status: "disabled";
    reason: string;
};
export declare const signerAdapters: () => SignerAdapterStatus[];
