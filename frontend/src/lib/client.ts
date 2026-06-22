import { createPublicClient, http } from "viem";
import { DEFAULT_NETWORK, type NetworkConfig } from "./chains";

/** Build a read-only client for a specific network. */
export function makePublicClient(network: NetworkConfig) {
  return createPublicClient({
    chain: network.chain,
    transport: http(network.rpcUrl),
  });
}

// Default client (Ethereum Sepolia) — used for the disconnected/default view.
// Components should prefer the chain-aware client from `useNetwork()`.
export const publicClient = makePublicClient(DEFAULT_NETWORK);
