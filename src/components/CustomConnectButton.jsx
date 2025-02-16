import React from "react";
import { useConnectWallet } from "@web3-onboard/react";
import { BiWallet } from "react-icons/bi";

const CustomConnectButton = () => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

  return (
    <div>
      {!wallet ? (
        <button
          onClick={() => connect()}
          disabled={connecting}
          className="bg-accent hover:bg-accent/90 text-energybar font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 font-Syne"
        >
          <BiWallet className="w-6 h-6" />
          {connecting ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <div className="flex gap-4">
          <button className="bg-cards flex items-center gap-2 py-3 px-6 rounded-lg hover:bg-cards2 transition-all duration-200 text-primary font-Syne">
            <img src={wallet.icon} alt={wallet.label} className="w-6 h-6" />
          </button>
          <button
            onClick={() => disconnect(wallet)}
            className="bg-cards flex items-center gap-2 py-3 px-6 rounded-lg hover:bg-cards2 transition-all duration-200 text-primary font-Syne"
          >
            {wallet.accounts[0].address.slice(0, 6)}...
            {wallet.accounts[0].address.slice(-4)}
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomConnectButton;
