import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { format, addWeeks, isAfter } from "date-fns";
import { STAKING_REWARDS } from "../constants/stakingConfig";
import {
  stakeNFT,
  unstakeNFT,
  getStakedNFTs,
} from "../services/stakingService";
import { useUser } from "../context/userContext";
import { FaLock, FaUnlock, FaClock, FaPercentage } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { Timestamp } from "firebase/firestore";

const NFTCard = ({ nft, onUpdate, chainType }) => {
  const { id: userId } = useUser();
  const [stakePeriod, setStakePeriod] = useState(1);
  const [isStaked, setIsStaked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stakeInfo, setStakeInfo] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Parse metadata if it's a string (Polygon case)
  const getNFTMetadata = () => {
    try {
      if (typeof nft.metadata === "string") {
        return JSON.parse(nft.metadata);
      }
      return nft.metadata;
    } catch (error) {
      console.error("Error parsing NFT metadata:", error);
      return null;
    }
  };

  const metadata = getNFTMetadata();
  // Handle IPFS URLs for Ethereum NFTs
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("ipfs://")) {
      return imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    return imageUrl;
  };

  const imageUrl = getImageUrl(metadata?.image);

  useEffect(() => {
    checkStakeStatus();
  }, [nft, userId]);

  const checkStakeStatus = async () => {
    if (!userId) return;

    const stakedNFTs = await getStakedNFTs(userId);
    const stake = stakedNFTs.find((s) => s.nftId === nft.token_id);

    if (stake) {
      setIsStaked(true);
      setStakeInfo(stake);
    } else {
      setIsStaked(false);
      setStakeInfo(null);
    }
  };

  const handleStake = async () => {
    if (!userId) {
      toast.error("Please connect your wallet first");
      return;
    }

    setLoading(true);
    const startDate = new Date();
    const endDate = addWeeks(startDate, stakePeriod);

    const stakeData = {
      nft,
      startDate,
      endDate,
      stakePeriod,
      rewardPercentage: STAKING_REWARDS[1][stakePeriod],
    };

    const success = await stakeNFT(userId, stakeData);
    if (success) {
      await checkStakeStatus();
      onUpdate?.();
    }
    setLoading(false);
  };

  const handleUnstake = async () => {
    if (!userId) return;

    if (stakeInfo && isAfter(new Date(stakeInfo.endDate), new Date())) {
      toast.error("Cannot unstake before lock period ends");
      return;
    }

    setLoading(true);
    const success = await unstakeNFT(userId, nft.token_id);
    if (success) {
      await checkStakeStatus();
      onUpdate?.();
    }
    setLoading(false);
  };

  return (
    <div
      className="relative group bg-gray-800 rounded-lg overflow-hidden"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {isStaked && stakeInfo && (
        <div className="absolute top-0 left-0 right-0 bg-green-500 bg-opacity-90 text-white p-2 rounded-t-lg text-center z-10">
          <p className="text-sm">
            Staked until:{" "}
            {stakeInfo?.endDate instanceof Timestamp
              ? format(stakeInfo.endDate.toDate(), "PPP")
              : format(new Date(stakeInfo?.endDate), "PPP")}
          </p>
          <button
            onClick={handleUnstake}
            disabled={
              loading ||
              (stakeInfo &&
                !isAfter(
                  new Date(),
                  stakeInfo.endDate instanceof Timestamp
                    ? stakeInfo.endDate.toDate()
                    : new Date(stakeInfo.endDate)
                ))
            }
            className="mt-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm flex items-center justify-center gap-1 w-full"
          >
            <FaUnlock className="text-xs" />{" "}
            {loading ? "Unstaking..." : "Unstake"}
          </button>
        </div>
      )}
      <div className="aspect-square relative">
        {imageUrl ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              </div>
            )}
            <img
              src={imageUrl}
              alt={metadata?.name || "NFT"}
              className={`w-full h-full object-cover ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              loading="lazy"
              onLoad={() => setImageLoading(false)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
        <div className="space-y-1">
          <p className="text-white font-semibold text-sm truncate">
            {metadata?.name || `#${nft.token_id}`}
          </p>
          <div className="flex items-center justify-between">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                chainType === "ethereum"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-purple-500/20 text-purple-400"
              }`}
            >
              {chainType === "ethereum" ? "ETH" : "MATIC"}
            </span>
            {metadata?.attributes && showDetails && (
              <span className="text-xs text-gray-300">
                {metadata.attributes.length} traits
              </span>
            )}
          </div>
        </div>

        {!isStaked && showDetails && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <FaClock className="text-accent text-sm" />
              <select
                value={stakePeriod}
                onChange={(e) => setStakePeriod(Number(e.target.value))}
                className="w-full p-1.5 rounded-lg bg-gray-700 text-white text-sm"
                disabled={loading}
              >
                <option value={1}>1 Week</option>
                <option value={2}>2 Weeks</option>
                <option value={3}>3 Weeks</option>
                <option value={4}>4 Weeks</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FaPercentage className="text-accent" />
              <span className="text-white">
                Reward: {STAKING_REWARDS[1][stakePeriod]}%
              </span>
            </div>
            <button
              onClick={handleStake}
              disabled={loading}
              className="w-full px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              <FaLock /> {loading ? "Staking..." : "Stake NFT"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTCard;
