import { createPublicClient, erc20Abi, formatEther, formatUnits, http } from "viem";
import { arcTestnet } from "viem/chains";
const USDC = "0x3600000000000000000000000000000000000000";
const EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";
const createArcClient = (config) => createPublicClient({
    chain: arcTestnet,
    transport: http(config.rpcUrl)
});
export const getArcStatus = async (config) => {
    const client = createArcClient(config);
    const [chainId, blockNumber] = await Promise.all([
        client.getChainId(),
        client.getBlockNumber()
    ]);
    return {
        network: config.network,
        expectedChainId: arcTestnet.id,
        chainId,
        ok: chainId === arcTestnet.id,
        blockNumber: blockNumber.toString()
    };
};
export const getArcBalance = async (config, address) => {
    const client = createArcClient(config);
    const [nativeBalance, usdcBalance, eurcBalance] = await Promise.all([
        client.getBalance({ address }),
        client.readContract({ address: USDC, abi: erc20Abi, functionName: "balanceOf", args: [address] }),
        client.readContract({ address: EURC, abi: erc20Abi, functionName: "balanceOf", args: [address] })
    ]);
    return {
        address,
        network: config.network,
        nativeUsdcGas: formatEther(nativeBalance),
        usdc: formatUnits(usdcBalance, 6),
        eurc: formatUnits(eurcBalance, 6)
    };
};
