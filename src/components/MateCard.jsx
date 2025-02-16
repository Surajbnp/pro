import React, { useState, useEffect } from "react";
import { fetchUserDetails } from "../utils/referral";
import coinsmall from "../images/coinsmall.webp";
import { motion } from "framer-motion";
import formatNumber from "../utils/formatNumber";

const MateCard = ({ userId }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      // Try Telegram users first, then web users
      let details = await fetchUserDetails(userId, true);
      if (!details) {
        details = await fetchUserDetails(userId, false);
      }
      setUserData(details);
      setLoading(false);
    };

    loadUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-cards rounded-[10px] p-[14px] flex items-center justify-center">
        <span className="text-[#d0d0d0]">Loading...</span>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-cards rounded-[10px] p-[14px] flex items-center justify-center">
        <span className="text-[#d0d0d0]">User not found</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-cards hover:bg-[#a4a4a445] transition-all duration-300 rounded-[16px] p-[16px] flex items-center justify-between group cursor-pointer border border-transparent hover:border-[#ffffff15]"
    >
      {/* Left Section - Avatar and User Info */}
      <div className="flex items-center space-x-3">
        <motion.div whileHover={{ scale: 1.1 }} className="relative">
          {/* Avatar */}
          <div className="w-[48px] h-[48px] rounded-full overflow-hidden border-2 border-[#ffffff15] bg-[#ffffff0a]">
            <img
              src={userData.character?.avatar || "/default-avatar.webp"}
              alt={userData.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Level Badge */}
          <div className="absolute -bottom-2 -right-2 bg-cards3 rounded-full p-[2px] border border-[#ffffff15]">
            <img
              src={userData.level.imgUrl}
              alt={userData.level.name}
              className="w-[18px] h-[18px]"
            />
          </div>
        </motion.div>

        {/* User Details */}
        <div className="flex flex-col">
          <h3 className="text-primary font-semibold text-[15px] group-hover:text-accent transition-colors duration-300">
            {userData.username || userData.name}
          </h3>
          <div className="flex items-center space-x-2 mt-[2px]">
            <span className="text-secondary text-[13px]">
              {userData.level.name}
            </span>
            <span className="w-[3px] h-[3px] rounded-full bg-[#ffffff30]" />
            <div className="flex items-center space-x-1">
              <img src={coinsmall} className="w-[14px]" alt="coin" />
              <span className="text-secondary text-[13px]">
                {formatNumber(userData.balance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Progress */}
      <div className="flex flex-col items-end">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-[#f5bb5f15] px-3 py-1 rounded-full"
        >
          <span className="text-accent text-[13px] font-medium">
            +{formatNumber(userData.tapBalance)} SHAKA
          </span>
        </motion.div>

        {/* Progress to next level */}
        {userData.level.nextLevel && (
          <div className="mt-2 flex flex-col items-end">
            <div className="w-[100px] h-[3px] bg-[#ffffff15] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    (userData.level.currentBalance /
                      userData.level.nextLevel.tapBalanceRequired) *
                    100
                  }%`,
                }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-accent"
              />
            </div>
            <span className="text-[11px] text-secondary mt-1">
              {formatNumber(userData.level.currentBalance)} /{" "}
              {formatNumber(userData.level.nextLevel.tapBalanceRequired)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MateCard;
