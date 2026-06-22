import { Link } from "react-router-dom";
import { useWallet, useNetwork } from "@/lib/wallet";
import { SUPPORTED_NETWORKS } from "@/lib/chains";

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function Header() {
  const { address, isConnected, connect, disconnect, switchChain } = useWallet();
  const { network, isSupported } = useNetwork();

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="brand">
          <span>⚽</span>
          <span>World Cup Prediction Market</span>
        </Link>

        {isConnected ? (
          <div className="wallet">
            {isSupported ? (
              <span className="net-badge" title="Active network">{network.label}</span>
            ) : (
              <span className="net-badge net-badge-warn" title="Unsupported network">
                Wrong network
              </span>
            )}
            {!isSupported &&
              SUPPORTED_NETWORKS.map((n) => (
                <button
                  key={n.chainId}
                  onClick={() => switchChain(n.chainId)}
                  className="link-btn"
                  title={`Switch to ${n.label}`}
                >
                  {n.label}
                </button>
              ))}
            <span className="wallet-addr">{shortAddress(address!)}</span>
            <button onClick={disconnect} className="link-btn">
              Disconnect
            </button>
          </div>
        ) : (
          <button onClick={connect} className="btn btn-primary btn-sm">
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
