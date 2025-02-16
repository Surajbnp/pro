import axios from "axios";
import { toast } from "react-hot-toast";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";

const MORALIS_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImFjOTI2ZjFiLTczOTctNDEyNS05MjJmLTY2ZGU4OTg0N2UwNSIsIm9yZ0lkIjoiNDI3NzE0IiwidXNlcklkIjoiNDM5OTUzIiwidHlwZUlkIjoiNzIyYWRkODYtODU2Zi00ZWQwLWEyN2ItMjA5ZDIzNzRjNzljIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Mzc5NjI3NzcsImV4cCI6NDg5MzcyMjc3N30.g5Fc9NqW6Duv1M-rp7CZsXd987orD2N-SkFrq_OYexs";
const BASE_URL = "https://deep-index.moralis.io/api/v2";

const moralisApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-API-Key": MORALIS_API_KEY,
  },
});

// Define the contract addresses we want to track
const TRACKED_CONTRACTS = {
  ethereum: ["0x12662b6a2a424a0090b7D09401fB775A9b968898"],
  polygon: [
    "0x72BCdE3C41c4Afa153F8E7849a9Cf64E2CC84E75",
    "0x46d5dCd9d8a9CA46E7972F53d584E14845968CF8",
    "0xAb9f149A82C6ad66C3795FBceb06ec351b13cfcf",
  ],
};

// Fetch NFTs for a wallet from multiple chains
export const fetchNFTs = async (address) => {
  try {
    // Fetch NFTs from both Ethereum and Polygon in parallel
    const [ethNFTs, polygonNFTs] = await Promise.all([
      moralisApi.get(`/${address}/nft`, {
        params: {
          chain: "eth",
          format: "decimal",
          limit: 100,
          token_addresses: TRACKED_CONTRACTS.ethereum,
        },
      }),
      moralisApi.get(`/${address}/nft`, {
        params: {
          chain: "polygon",
          format: "decimal",
          limit: 100,
          token_addresses: TRACKED_CONTRACTS.polygon,
        },
      }),
    ]);

    // Combine and mark the results with their respective chains
    const ethResults = (ethNFTs.data.result || []).map((nft) => ({
      ...nft,
      chain: "ethereum",
    }));

    const polygonResults = (polygonNFTs.data.result || []).map((nft) => ({
      ...nft,
      chain: "polygon",
    }));

    // Combine all results
    return {
      result: [...ethResults, ...polygonResults],
      total: ethResults.length + polygonResults.length,
      page: 1,
      page_size: ethResults.length + polygonResults.length,
    };
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    throw error;
  }
};

// Fetch native token balance (ETH)
export const fetchNativeBalance = async (address, chain = "eth") => {
  try {
    const response = await moralisApi.get(`/${address}/balance`, {
      params: {
        chain,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching native balance:", error);
    throw error;
  }
};

// Fetch ERC20 tokens
export const fetchTokens = async (address, chain = "eth") => {
  try {
    const response = await moralisApi.get(`/${address}/erc20`, {
      params: {
        chain,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching tokens:", error);
    throw error;
  }
};

// Fetch all wallet data in parallel
export const fetchWalletData = async (address) => {
  try {
    const [nfts, ethBalance, polygonBalance, ethTokens, polygonTokens] =
      await Promise.all([
        fetchNFTs(address),
        fetchNativeBalance(address, "eth"),
        fetchNativeBalance(address, "polygon"),
        fetchTokens(address, "eth"),
        fetchTokens(address, "polygon"),
      ]);

    // Combine balances and tokens from both chains
    const walletData = {
      nfts,
      balance: {
        ethereum: ethBalance,
        polygon: polygonBalance,
      },
      tokens: {
        ethereum: ethTokens,
        polygon: polygonTokens,
      },
      lastUpdated: Date.now(),
    };

    localStorage.setItem(`wallet_${address}`, JSON.stringify(walletData));
    return walletData;
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    throw error;
  }
};

// Save/update wallet data in Firestore
export const saveWalletToDB = async (walletData, address, userId) => {
  // Skip DB operations if no userId
  if (!userId) {
    console.log("No userId provided, skipping DB save");
    return false;
  }

  try {
    const walletRef = doc(db, "wallets", address);
    const walletSnap = await getDoc(walletRef);

    const dataToSave = {
      walletAddress: address,
      userId: userId,
      lastConnected: Date.now(),
      balance: walletData.balance,
      tokens: walletData.tokens,
      nfts: walletData.nfts.result,
      lastUpdated: Date.now(),
    };

    if (walletSnap.exists()) {
      // Update existing wallet
      await updateDoc(walletRef, dataToSave);
    } else {
      // Create new wallet document
      await setDoc(walletRef, {
        ...dataToSave,
        createdAt: Date.now(),
      });
    }

    return true;
  } catch (error) {
    console.error("Error saving wallet data:", error);
    toast.error("Failed to save wallet data");
    throw error;
  }
};

// Check if wallet exists in Firestore and belongs to user
export const checkWalletExists = async (address, userId) => {
  // Skip DB check if no userId
  if (!userId) {
    console.log("No userId provided, skipping DB check");
    return false;
  }

  try {
    const walletRef = doc(db, "wallets", address);
    const walletSnap = await getDoc(walletRef);

    if (walletSnap.exists()) {
      const walletData = walletSnap.data();
      return walletData.userId === userId;
    }
    return false;
  } catch (error) {
    console.error("Error checking wallet:", error);
    toast.error("Failed to check wallet status");
    throw error;
  }
};

// Get user's wallets
export const getUserWallets = async (userId) => {
  // Skip DB query if no userId
  if (!userId) {
    console.log("No userId provided, skipping wallet fetch");
    return [];
  }

  try {
    const walletsRef = collection(db, "wallets");
    const q = query(walletsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const wallets = [];
    querySnapshot.forEach((doc) => {
      wallets.push({ id: doc.id, ...doc.data() });
    });

    return wallets;
  } catch (error) {
    console.error("Error fetching user wallets:", error);
    toast.error("Failed to fetch wallets");
    throw error;
  }
};

// Update getWalletData to include userId
export const getWalletData = async (address, forceRefresh = false, userId) => {
  try {
    // Check localStorage first if not forcing refresh
    if (!forceRefresh) {
      const cached = localStorage.getItem(`wallet_${address}`);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        const cacheAge = Date.now() - parsedCache.lastUpdated;

        // If cache is less than 5 minutes old, use it
        if (cacheAge < 5 * 60 * 1000) {
          return parsedCache;
        }
      }
    }

    // If no cache, cache expired, or force refresh, fetch fresh data
    const freshData = await fetchWalletData(address);

    // Save to Firestore only if userId is provided
    if (userId) {
      await saveWalletToDB(freshData, address, userId);
    }

    return freshData;
  } catch (error) {
    console.error("Error getting wallet data:", error);
    toast.error("Failed to fetch wallet data. Please try again.");
    throw error;
  }
};
