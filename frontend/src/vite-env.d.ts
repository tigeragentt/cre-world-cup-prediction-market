/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly CONTRACT_ADDRESS: string;
  readonly RPC_URL: string;
  // Base Sepolia (optional — only needed to use the Base network)
  readonly CONTRACT_ADDRESS_BASE: string;
  readonly RPC_URL_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

interface Window {
  ethereum?: EthereumProvider;
}
