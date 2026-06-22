import { useWallet, useNetwork } from "@/lib/wallet";

/**
 * Warns when the active network has no contract deployed (zero address) — e.g.
 * before `CONTRACT_ADDRESS_BASE` is set after deploying to Base Sepolia.
 */
export function NetworkBanner() {
  const { isConnected } = useWallet();
  const { network, isSupported, isContractConfigured } = useNetwork();

  // Unsupported chains are handled by the header (with switch buttons).
  if (!isSupported || isContractConfigured) return null;

  return (
    <div className="container">
      <div className="net-warning">
        ⚠️ No contract is configured for <strong>{network.label}</strong>.
        {isConnected
          ? " Deploy the WorldCupPredictionMarket contract on this network and set its address in the frontend .env, or switch your wallet to a configured network."
          : " Set its address in the frontend .env to use this network."}
      </div>
    </div>
  );
}
