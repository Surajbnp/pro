import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getWalletData } from "../utils/walletUtility";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { useUser } from "../context/userContext";
import NFTCard from "../components/NFTCard";
import Spinner from "../components/Spinner";
import { BiLoaderAlt } from "react-icons/bi";

const WalletDashboard = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { id: userId } = useUser();
  const [walletData, setWalletData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isConnected && address && userId) {
      fetchWalletData();
    }
  }, [isConnected, address, userId]);

  useEffect(() => {
    document.body.style.cursor = "default";
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  const cardHoverStyle = {
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const fetchWalletData = async () => {
    try {
      const data = await getWalletData(address, "eth", false, userId);
      setWalletData(data);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      toast.error("Failed to fetch wallet data");
    }
  };

  const handleRefresh = async () => {
    if (!userId) {
      toast.error("Please login first");
      return;
    }

    try {
      setIsRefreshing(true);
      const freshData = await getWalletData(address, "eth", true, userId);
      setWalletData(freshData);
      toast.success("Wallet data refreshed successfully!");
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("Failed to refresh wallet data");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#1D1D1D] flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-accent font-Syne text-2xl mb-4">
            Wallet Not Connected
          </h1>
          <button
            onClick={() => navigate("/wallet")}
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-opacity-90 transition-all"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (!walletData) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-[#1D1D1D] p-4 sm:p-6 md:p-8 ">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-accent font-Syne text-3xl font-bold mb-4 sm:mb-0">
            Wallet Dashboard
          </h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-all"
          >
            {isRefreshing ? (
              <span className="flex items-center gap-2">
                <BiLoaderAlt className="animate-spin h-5 w-5" />
                Refreshing...
              </span>
            ) : (
              "Refresh Data"
            )}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2  gap-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cards3 p-6 rounded-xl border border-borders"
          >
            <h2 className="text-accent text-xl font-semibold mb-4">
              Wallet Overview
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-secondary">Address</span>
                <span className="text-white truncate ml-2">
                  {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">ETH Balance</span>
                <span className="text-white">
                  {walletData?.balance?.ethereum?.balance
                    ? formatEther(walletData.balance.ethereum.balance)
                    : "0"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">MATIC Balance</span>
                <span className="text-white">
                  {walletData?.balance?.polygon?.balance
                    ? formatEther(walletData.balance.polygon.balance)
                    : "0"}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-cards3 p-6 rounded-xl border border-borders relative group"
            style={cardHoverStyle}
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute inset-0 bg-accent opacity-0 group-hover:opacity-5 rounded-xl transition-opacity" />
            <h2 className="text-accent text-xl font-semibold mb-4">
              NFT Holdings
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-secondary">Total NFTs</span>
                <span className="text-white">
                  {walletData?.nfts?.result?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Ethereum NFTs</span>
                <span className="text-white">
                  {walletData?.nfts?.result?.filter(
                    (nft) => nft.chain === "ethereum"
                  )?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Polygon NFTs</span>
                <span className="text-white">
                  {walletData?.nfts?.result?.filter(
                    (nft) => nft.chain === "polygon"
                  )?.length || 0}
                </span>
              </div>

              {/* NFT Grid */}
              <div className="mt-4">
                <div className="grid grid-cols-2 gap-3 p-1">
                  {walletData?.nfts?.result?.map((nft) => (
                    <NFTCard
                      key={`${nft.token_address}-${nft.token_id}`}
                      nft={nft}
                      chainType={nft.chain}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard;
