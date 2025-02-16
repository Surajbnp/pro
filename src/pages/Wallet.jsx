import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import CustomConnectButton from "../components/CustomConnectButton";
import { getWalletData, checkWalletExists } from "../utils/walletUtility";
import { useAccount } from "wagmi";
import { useUser } from "../context/userContext";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useConnectWallet } from "@web3-onboard/react";
import ThirdWebWallet from "../components/ThirdWebWallet";

const Wallet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [{ wallet }] = useConnectWallet();
  const { id: userId } = useUser();
  const [walletData, setWalletData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDashboardOption, setShowDashboardOption] = useState(false);
  const showNFTs = location?.state?.showNFTs;


  // Effect to handle initial wallet connection
  useEffect(() => {
    if (wallet && userId) {
      handleWalletConnection();
    }
  }, [wallet, userId]);

  useEffect(() => {
    if (showNFTs && walletData) {
      // Scroll to NFT section
      const nftSection = document.getElementById("nft-section");
      if (nftSection) {
        nftSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [showNFTs, walletData]);

  const handleWalletConnection = async () => {
    if (!userId) {
      toast.error("Please login first");
      return;
    }

    try {
      setIsLoading(true);
      const address = wallet.accounts[0].address;
      const exists = await checkWalletExists(address, userId);
      const data = await getWalletData(address, "eth", false, userId);
      setWalletData(data);

      toast.success(
        exists
          ? "Wallet data updated successfully!"
          : "New wallet connected and data saved!"
      );
      setShowDashboardOption(true);
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to process wallet connection");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1D1D1D] flex flex-col items-center justify-center p-4">
      <div className="bg-cards3 p-8 rounded-2xl shadow-lg max-w-screen-lg w-full border border-borders">
        <h1 className="text-accent font-Syne text-3xl font-bold text-center mb-8">
          {wallet ? "Wallet Details" : "Connect Wallet"}
        </h1>

        <div className="flex flex-col items-center gap-4">
          {/* <CustomConnectButton /> */}
          <ThirdWebWallet />

          {isLoading && <p>Saving wallet data...</p>}
          {wallet && showDashboardOption && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-cards3 p-6 rounded-xl border border-borders text-center mt-4"
            >
              <h3 className="text-accent text-xl mb-4">
                Where would you like to go?
              </h3>
              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/wallet-dashboard")}
                  className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-opacity-90 transition-all"
                >
                  View Dashboard
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDashboardOption(false)}
                  className="px-6 py-3 bg-[#2D2D2D] text-white rounded-lg hover:bg-opacity-90 transition-all"
                >
                  Stay Here
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
