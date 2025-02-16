import React, { useState, useEffect } from "react";
import { createThirdwebClient } from "thirdweb";
import {
  ConnectButton,
  useActiveAccount,
  useWalletBalance,
} from "thirdweb/react";
import { darkTheme } from "thirdweb/react";
import { createWallet, walletConnect } from "thirdweb/wallets";
import { FaWallet } from "react-icons/fa";
import { TonConnectButton } from "@tonconnect/ui-react";

const client = createThirdwebClient({
  clientId: "30b0a2d7a206d41a5bfc150d57f5bee0",
});

const ThirdWebWallet = () => {
  const [walletsToUse, setWalletsToUse] = useState([]);
  const account = useActiveAccount();
  const { data: balance, isLoading } = useWalletBalance({
    client,
    chain: "ethereum",
    address: account?.address,
  });
  useEffect(() => {
    if (Telegram.WebApp.initDataUnsafe?.user) {
      setWalletsToUse([
        walletConnect({
          qrcode: false,
          mobile: {
            getUri: (uri) =>
              `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`,
          },
        }),
      ]);
    } else {
      setWalletsToUse([
        createWallet("io.metamask"),
        createWallet("com.coinbase.wallet"),
        createWallet("app.phantom"),
        createWallet("me.rainbow"),
        createWallet("com.trustwallet.app"),
      ]);
    }
  }, []);

  return (
    <div>
      <div>
        <ConnectButton
          client={client}
          wallets={walletsToUse}
          theme={darkTheme({
            colors: {
              modalBg: "#000000",
              primaryButtonBg: "#FBC535",
              primaryButtonText: "#000000",
              secondaryButtonBg: "#333333",
              secondaryButtonText: "#ffffff",
            },
          })}
          connectModal={{ size: "compact" }}
        />
      </div>
      <div style={{ marginTop: "20px" }}>
        <TonConnectButton />
      </div>
    </div>
  );
};

export default ThirdWebWallet;
