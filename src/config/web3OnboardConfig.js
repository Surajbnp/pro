import injectedModule from "@web3-onboard/injected-wallets";
import walletConnectModule from "@web3-onboard/walletconnect";
import coinbaseModule from "@web3-onboard/coinbase";
import trustModule from "@web3-onboard/trust";
import phantomModule from "@web3-onboard/phantom";
import web3AuthModule from "@web3-onboard/web3auth";

// Initialize wallet modules
const walletConnect = walletConnectModule({
  projectId: "0172cf3cfab54f05b2ad8a6bd21b79ac",
  version: 2,
  requiredChains: [1, 137],
});

const coinbase = coinbaseModule();
const trust = trustModule();
const injected = injectedModule();
const phantom = phantomModule();
const web3Auth = web3AuthModule();

// Group wallets by their intended categories
const popularWallets = [injected, phantom];
const recommendedWallets = [coinbase, trust];
const otherWallets = [walletConnect, web3Auth];

// Chain configurations
const chains = [
  {
    id: "0x1",
    token: "ETH",
    label: "Ethereum Mainnet",
    rpcUrl: "https://ethereum.publicnode.com",
  },
  {
    id: "0x89",
    token: "MATIC",
    label: "Polygon Mainnet",
    rpcUrl: "https://polygon-rpc.com",
  },
];

// Group wallets using the display property
const web3OnboardConfig = {
  wallets: [
    {
      label: "Popular",
      wallets: popularWallets,
    },
    {
      label: "Recommended",
      wallets: recommendedWallets,
    },
    {
      label: "Other Options",
      wallets: otherWallets,
    },
  ].flatMap((group) => group.wallets),
  chains,
  appMetadata: {
    name: "Prime Mates",
    icon: "https://firebasestorage.googleapis.com/v0/b/primematebc.firebasestorage.app/o/assets%2Fbronze.webp?alt=media&token=e936e14f-7288-434c-86fc-71b6d685ccca",
    description: "Prime Mates",
    recommendedInjectedWallets: [
      { name: "MetaMask", url: "https://metamask.io" },
      { name: "Coinbase", url: "https://wallet.coinbase.com/" },
    ],
  },
  connect: {
    autoConnectLastWallet: true,
    showSidebar: true,
  },
  theme: {
    "--w3o-background-color": "#1D1D1D",
    "--w3o-foreground-color": "#303030",
    "--w3o-text-color": "#ffffff",
    "--w3o-border-color": "#303030",
    "--w3o-action-color": "#f5bb5f",
    "--w3o-border-radius": "12px",
  },
};

export default web3OnboardConfig;
