export const STAKING_REWARDS = {
  // Number of NFTs -> Reward percentage based on lock period (in weeks)
  1: {
    1: 10, // 1 NFT, 1 week = 10% boost
    2: 15, // 1 NFT, 2 weeks = 15% boost
    3: 20, // 1 NFT, 3 weeks = 20% boost
    4: 25, // 1 NFT, 4 weeks = 25% boost
  },
  2: {
    1: 20,
    2: 30,
    3: 40,
    4: 50,
  },
  3: {
    1: 35,
    2: 45,
    3: 55,
    4: 65,
  },
  4: {
    1: 50, // 4 NFTs, 1 week = 50% boost
    2: 65,
    3: 80,
    4: 100, // 4 NFTs, 4 weeks = 100% boost
  },
};

export const MINIMUM_STAKE_PERIOD = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
export const MAXIMUM_STAKE_PERIOD = 28 * 24 * 60 * 60 * 1000; // 4 weeks in milliseconds
