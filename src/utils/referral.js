import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { toast } from "react-hot-toast";
import { friendsRewards } from "../pages/Rewards";

// Create or update referral document
export const handleReferral = async (referrerId, newUserId) => {
  try {
    // Validate inputs
    if (!referrerId || !newUserId) {
      console.error("Invalid referral parameters");
      return false;
    }

    // Prevent self-referral
    if (referrerId === newUserId) {
      console.error("Self-referral not allowed");
      return false;
    }

    // Reference to the specific sender's referral document
    const referralRef = doc(db, "referrals", referrerId);
    const referralDoc = await getDoc(referralRef);

    if (referralDoc.exists()) {
      // Check if user was already referred
      const existingData = referralDoc.data();
      if (existingData.usersSignedUp.includes(newUserId)) {
        console.error("User already referred");
        return false;
      }

      // Update existing referral document for this sender
      await updateDoc(referralRef, {
        usersSignedUp: arrayUnion(newUserId),
        totalReferrals: increment(1),
        updatedAt: new Date(),
      });
    } else {
      // Create new referral document for this sender
      await setDoc(referralRef, {
        usersSignedUp: [newUserId],
        claimedUsers: [],
        totalReferrals: 1,
        totalClaimed: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    toast.success("Welcome! You received 50,000 SHAKA coins from referral!");
    return true;
  } catch (error) {
    console.error("Error handling referral:", error);
    return false;
  }
};

// Get initial balance based on referral
export const getInitialBalance = (referrerId) => {
  return referrerId ? 50000 : 100;
};

// Extract referral ID from URL parameters
export const getReferralFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("ref");
};

// Extract referral ID from Telegram start parameter
export const getReferralFromTelegram = () => {
  const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
  return startParam?.startsWith("r") ? startParam.substring(1) : null;
};

// Create base user data object
export const createBaseUserData = (
  userId,
  initialBalance,
  additionalData = {}
) => {
  return {
    userId,
    createdAt: new Date(),
    balance: initialBalance,
    tapBalance: initialBalance,
    energy: 500,
    battery: { level: 1, energy: 500 },
    tapValue: { level: 1, value: 1 },
    level: { id: 1, name: "Bronze", imgUrl: "/bronze.webp" },
    character: { name: "", avatar: "" },
    selectedExchange: {
      id: "selectex",
      icon: "/exchange.svg",
      name: "Select exchange",
    },
    freeGuru: 3,
    ...additionalData,
  };
};

// Add this new function to fetch user details
export const fetchUserDetails = async (userId, isTelegramUser = false) => {
  try {
    const collection = isTelegramUser ? "telegramUsers" : "users";
    const userRef = doc(db, collection, userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        userId: userId,
        name: userData.fullName || userData.firstName || "Anonymous",
        email: userData.email || null,
        username: userData.username || null,
        character: userData.character || null,
        level: userData.level || {
          id: 1,
          name: "Bronze",
          imgUrl: "/bronze.webp",
        },
        balance: userData.balance || 0,
        tapBalance: userData.tapBalance || 0,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
};

// Add this new function to handle claims
export const handleClaimReferralRewards = async (
  referrerId,
  rewardThreshold
) => {
  try {
    const referralRef = doc(db, "referrals", referrerId);
    const referralDoc = await getDoc(referralRef);

    if (!referralDoc.exists()) {
      throw new Error("No referral found");
    }

    const data = referralDoc.data();
    const { usersSignedUp = [], claimedUsers = [], claimedLevels = [] } = data;

    // Check if this level was already claimed
    if (claimedLevels.includes(rewardThreshold)) {
      return {
        success: false,
        message: "You've already claimed this reward!",
        remainingCount: usersSignedUp.length,
      };
    }

    // Get unclaimed users
    const unclaimedUsers = usersSignedUp.filter(
      (userId) => !claimedUsers.includes(userId)
    );

    // Check if we have enough unclaimed users for this threshold
    if (unclaimedUsers.length < rewardThreshold) {
      return {
        success: false,
        message: `Need ${rewardThreshold} referrals to claim this reward. You have ${unclaimedUsers.length} unclaimed referrals.`,
        remainingCount: unclaimedUsers.length,
      };
    }

    // Take exactly the number of users needed for this threshold
    const usersToProcess = unclaimedUsers.slice(0, rewardThreshold);

    // Find the corresponding reward from friendsRewards array
    const reward = friendsRewards.find(
      (r) => r.referralsRequired === rewardThreshold
    );
    if (!reward) {
      throw new Error("Invalid reward threshold");
    }

    // Remove claimed users from usersSignedUp and add to claimedUsers
    const updatedUsersSignedUp = usersSignedUp.filter(
      (userId) => !usersToProcess.includes(userId)
    );
    const updatedClaimedUsers = [...claimedUsers, ...usersToProcess];

    // Update referral document with new arrays and claimed level
    await updateDoc(referralRef, {
      usersSignedUp: updatedUsersSignedUp,
      claimedUsers: updatedClaimedUsers,
      claimedLevels: arrayUnion(rewardThreshold),
      totalClaimed: increment(usersToProcess.length),
      updatedAt: new Date(),
    });

    // Update referrer's balance with the bonus award
    const userRef = doc(db, "users", referrerId);
    await updateDoc(userRef, {
      balance: increment(reward.bonusAward),
      refBonus: increment(reward.bonusAward),
    });

    return {
      success: true,
      message: `Successfully claimed reward for ${rewardThreshold} referrals!`,
      claimedUsers: usersToProcess,
      reward: reward.bonusAward,
      remainingCount: updatedUsersSignedUp.length,
      claimedLevel: rewardThreshold,
    };
  } catch (error) {
    console.error("Error claiming referral rewards:", error);
    return {
      success: false,
      message: "Failed to claim rewards",
      error: error.message,
    };
  }
};
