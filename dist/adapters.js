export const signerAdapters = () => [
    {
        id: "walletconnect",
        label: "WalletConnect",
        status: "disabled",
        reason: "Adapter boundary prepared. Signing is not enabled in v0."
    },
    {
        id: "circle-wallets",
        label: "Circle wallets",
        status: "disabled",
        reason: "Adapter boundary prepared. Circle wallet execution requires a later configuration phase."
    },
    {
        id: "local-encrypted-key",
        label: "Local encrypted key",
        status: "disabled",
        reason: "Local key custody requires a later security review."
    }
];
