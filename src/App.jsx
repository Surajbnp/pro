import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import router from "./router";
import { Toaster } from "react-hot-toast";
import { AdminContextProvider } from "./contexts/AdminContext";
import { Web3OnboardProvider, init } from "@web3-onboard/react";
import web3OnboardConfig from "./config/web3OnboardConfig";
import { WagmiProvider } from "wagmi";
import wagmiConfig from "./config/wagmiConfig";

const web3Onboard = init(web3OnboardConfig);

const App = () => {
  useEffect(() => {
    if (window?.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <Web3OnboardProvider web3Onboard={web3Onboard}>
        <AuthContextProvider>
          <AdminContextProvider>
            <Toaster />
            <RouterProvider router={router} />
          </AdminContextProvider>
        </AuthContextProvider>
      </Web3OnboardProvider>
    </WagmiProvider>
  );
};

export default App;
