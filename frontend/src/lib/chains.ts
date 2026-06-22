import { sepolia, baseSepolia } from "viem/chains";
import type { Chain } from "viem";

// ─── Supported networks ──────────────────────────────────────────────────────
// The app defaults to Ethereum Sepolia. When a wallet connects we read its
// chain id and switch the active network (contract address + RPC) accordingly.

export interface NetworkConfig {
  chainId: number;
  chain: Chain;
  label: string;
  contractAddress: `0x${string}`;
  rpcUrl?: string;
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function asAddress(value: string | undefined): `0x${string}` {
  return (value || ZERO_ADDRESS) as `0x${string}`;
}

/** True when a real (non-zero) contract address is configured for the network. */
export function hasContract(network: NetworkConfig): boolean {
  return network.contractAddress.toLowerCase() !== ZERO_ADDRESS;
}

export const ETHEREUM_SEPOLIA: NetworkConfig = {
  chainId: sepolia.id, // 11155111
  chain: sepolia,
  label: "Ethereum Sepolia",
  contractAddress: asAddress(import.meta.env.CONTRACT_ADDRESS),
  rpcUrl: import.meta.env.RPC_URL || undefined,
};

export const BASE_SEPOLIA: NetworkConfig = {
  chainId: baseSepolia.id, // 84532
  chain: baseSepolia,
  label: "Base Sepolia",
  contractAddress: asAddress(import.meta.env.CONTRACT_ADDRESS_BASE),
  rpcUrl: import.meta.env.RPC_URL_BASE || undefined,
};

// Shown before a wallet connects, or when connected to an unsupported chain.
export const DEFAULT_NETWORK = ETHEREUM_SEPOLIA;

export const SUPPORTED_NETWORKS: NetworkConfig[] = [ETHEREUM_SEPOLIA, BASE_SEPOLIA];

/** Active network for a given chain id, falling back to the default. */
export function getNetwork(chainId?: number | null): NetworkConfig {
  return SUPPORTED_NETWORKS.find((n) => n.chainId === chainId) ?? DEFAULT_NETWORK;
}

export function isSupportedChain(chainId?: number | null): boolean {
  return SUPPORTED_NETWORKS.some((n) => n.chainId === chainId);
}

/** Params for `wallet_addEthereumChain` so the wallet can add a missing network. */
export function makeAddChainParams(chainId: number) {
  const { chain, rpcUrl } = getNetwork(chainId);
  return {
    chainId: `0x${chainId.toString(16)}`,
    chainName: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: rpcUrl ? [rpcUrl] : [...chain.rpcUrls.default.http],
    blockExplorerUrls: chain.blockExplorers
      ? [chain.blockExplorers.default.url]
      : [],
  };
}
