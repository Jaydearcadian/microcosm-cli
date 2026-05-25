import type { McosmConfig } from "./config.js";

const USDC = "0x3600000000000000000000000000000000000000";
const EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";
const ARC_TESTNET_CHAIN_ID = 5042002;
const BALANCE_OF_SELECTOR = "70a08231";

type JsonRpcResult = string;

const rpcCall = async (config: McosmConfig, method: string, params: unknown[] = []): Promise<JsonRpcResult> => {
  const response = await fetch(config.rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
  });
  if (!response.ok) {
    throw new Error(`Arc RPC ${method} failed with HTTP ${response.status}`);
  }
  const body = await response.json() as { result?: JsonRpcResult; error?: { message?: string } };
  if (body.error) {
    throw new Error(`Arc RPC ${method} failed: ${body.error.message ?? "unknown error"}`);
  }
  if (typeof body.result !== "string") {
    throw new Error(`Arc RPC ${method} returned an invalid result`);
  }
  return body.result;
};

const parseHexQuantity = (value: string) => Number(BigInt(value));

const encodeBalanceOf = (address: `0x${string}`) =>
  `0x${BALANCE_OF_SELECTOR}${address.slice(2).toLowerCase().padStart(64, "0")}`;

const formatUnits = (value: bigint, decimals: number) => {
  const scale = 10n ** BigInt(decimals);
  const whole = value / scale;
  const fraction = value % scale;
  const fractionText = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return fractionText ? `${whole}.${fractionText}` : whole.toString();
};

const readErc20Balance = async (config: McosmConfig, token: string, address: `0x${string}`) => {
  const result = await rpcCall(config, "eth_call", [{ to: token, data: encodeBalanceOf(address) }, "latest"]);
  return BigInt(result);
};

export const getArcStatus = async (config: McosmConfig) => {
  const [chainId, blockNumber] = await Promise.all([
    rpcCall(config, "eth_chainId"),
    rpcCall(config, "eth_blockNumber")
  ]);
  const parsedChainId = parseHexQuantity(chainId);
  return {
    network: config.network,
    expectedChainId: ARC_TESTNET_CHAIN_ID,
    chainId: parsedChainId,
    ok: parsedChainId === ARC_TESTNET_CHAIN_ID,
    blockNumber: BigInt(blockNumber).toString()
  };
};

export const getArcBalance = async (config: McosmConfig, address: `0x${string}`) => {
  const [nativeBalance, usdcBalance, eurcBalance] = await Promise.all([
    rpcCall(config, "eth_getBalance", [address, "latest"]).then(BigInt),
    readErc20Balance(config, USDC, address),
    readErc20Balance(config, EURC, address)
  ]);
  return {
    address,
    network: config.network,
    nativeUsdcGas: formatUnits(nativeBalance, 18),
    usdc: formatUnits(usdcBalance, 6),
    eurc: formatUnits(eurcBalance, 6)
  };
};
