import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { db } from "../firebase/config";

export const stakeNFT = async (userId, stakeData) => {
  try {
    const stakingRef = doc(db, "staking", userId);
    const stakingDoc = await getDoc(stakingRef);

    let currentStakes = stakingDoc.exists() ? stakingDoc.data().stakes : [];

    // Add new stake to the array
    currentStakes.push({
      nftId: stakeData.nft.token_id,
      nftContract: stakeData.nft.token_address,
      startDate: stakeData.startDate,
      endDate: stakeData.endDate,
      stakePeriod: stakeData.stakePeriod,
      rewardPercentage: stakeData.rewardPercentage,
      status: "active",
      createdAt: new Date(),
    });

    await setDoc(stakingRef, { stakes: currentStakes }, { merge: true });
    toast.success("NFT staked successfully!");
    return true;
  } catch (error) {
    console.error("Error staking NFT:", error);
    toast.error("Failed to stake NFT. Please try again.");
    return false;
  }
};

export const unstakeNFT = async (userId, nftId) => {
  try {
    const stakingRef = doc(db, "staking", userId);
    const stakingDoc = await getDoc(stakingRef);

    if (!stakingDoc.exists()) {
      toast.error("No staking record found");
      return false;
    }

    let currentStakes = stakingDoc.data().stakes;
    const updatedStakes = currentStakes.filter(
      (stake) => stake.nftId !== nftId
    );

    if (currentStakes.length === updatedStakes.length) {
      toast.error("NFT not found in staking");
      return false;
    }

    await setDoc(stakingRef, { stakes: updatedStakes }, { merge: true });
    toast.success("NFT unstaked successfully!");
    return true;
  } catch (error) {
    console.error("Error unstaking NFT:", error);
    toast.error("Failed to unstake NFT. Please try again.");
    return false;
  }
};

export const getStakedNFTs = async (userId) => {
  try {
    const stakingRef = doc(db, "staking", userId);
    const stakingDoc = await getDoc(stakingRef);

    if (!stakingDoc.exists()) {
      return [];
    }

    return stakingDoc.data().stakes || [];
  } catch (error) {
    console.error("Error fetching staked NFTs:", error);
    toast.error("Failed to fetch staked NFTs");
    return [];
  }
};

export const getStakingRewardMultiplier = async (userId) => {
  try {
    const stakingRef = doc(db, "staking", userId);
    const stakingDoc = await getDoc(stakingRef);

    if (!stakingDoc.exists()) {
      return 1;
    }

    const stakes = stakingDoc.data().stakes || [];
    const activeStakes = stakes.filter((stake) => stake.status === "active");

    if (activeStakes.length === 0) {
      return 1;
    }

    const highestRewardPercentage = Math.max(
      ...activeStakes.map((stake) => stake.rewardPercentage)
    );

    return 1 + highestRewardPercentage / 100;
  } catch (error) {
    console.error("Error getting staking reward multiplier:", error);
    return 1; // Return 1 as fallback in case of error
  }
};
