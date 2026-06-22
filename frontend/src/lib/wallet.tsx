import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createWalletClient, custom, type WalletClient } from "viem";
import {
  getNetwork,
  hasContract,
  isSupportedChain,
  makeAddChainParams,
  type NetworkConfig,
} from "./chains";
import { makePublicClient } from "./client";

interface WalletContextValue {
  address: `0x${string}` | null;
  walletClient: WalletClient | null;
  chainId: number | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (targetChainId: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextValue>({
  address: null,
  walletClient: null,
  chainId: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  switchChain: async () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);

  // Build a wallet client bound to whatever chain the wallet is currently on.
  const buildClient = useCallback((account: `0x${string}`, id: number) => {
    return createWalletClient({
      account,
      chain: getNetwork(id).chain,
      transport: custom(window.ethereum!),
    });
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet.");
      return;
    }
    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as `0x${string}`[];
    const hexChain = (await window.ethereum.request({
      method: "eth_chainId",
    })) as string;
    const id = Number(hexChain);

    setAddress(accounts[0]);
    setChainId(id);
    setWalletClient(buildClient(accounts[0], id));
  }, [buildClient]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setWalletClient(null);
  }, []);

  const switchChain = useCallback(async (targetChainId: number) => {
    if (!window.ethereum) return;
    const hexChain = `0x${targetChainId.toString(16)}`;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChain }],
      });
    } catch (e: any) {
      // 4902 = chain not added to the wallet yet — add it, then it becomes active.
      if (e?.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [makeAddChainParams(targetChainId)],
        });
      }
      // Other errors (e.g. user rejected) are surfaced by the wallet UI.
    }
  }, []);

  // React to account / chain changes from the wallet (after connecting).
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const onAccountsChanged = (accs: `0x${string}`[]) => {
      if (accs.length === 0) {
        disconnect();
        return;
      }
      setAddress(accs[0]);
      setChainId((id) => {
        if (id != null) setWalletClient(buildClient(accs[0], id));
        return id;
      });
    };

    const onChainChanged = (hexChain: string) => {
      const id = Number(hexChain);
      setChainId(id);
      setAddress((addr) => {
        if (addr) setWalletClient(buildClient(addr, id));
        return addr;
      });
    };

    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);
    return () => {
      window.ethereum?.removeListener?.("accountsChanged", onAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", onChainChanged);
    };
  }, [buildClient, disconnect]);

  return (
    <WalletContext.Provider
      value={{
        address,
        walletClient,
        chainId,
        isConnected: !!address,
        connect,
        disconnect,
        switchChain,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);

// ─── Active network ──────────────────────────────────────────────────────────
// Resolves the connected chain to a supported network (Ethereum Sepolia by
// default) and exposes a matching read client + contract address.

export function useNetwork() {
  const { chainId } = useWallet();
  const network: NetworkConfig = getNetwork(chainId);
  const publicClient = useMemo(() => makePublicClient(network), [network.chainId]);

  return {
    network,
    publicClient,
    contractAddress: network.contractAddress,
    isSupported: isSupportedChain(chainId),
    isContractConfigured: hasContract(network),
  };
}
