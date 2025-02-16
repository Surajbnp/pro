import React, { useEffect, useState } from "react";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { useUser } from "../context/userContext";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import Animate from "../components/Animate";
import { RiArrowRightSLine } from "react-icons/ri";
import { PiUsersThreeFill } from "react-icons/pi";
import Levels from "../components/Levels";
import ErrorBoundary from "../components/ErrorBoundary";
import { handleClaimReferralRewards } from "../utils/referral";

export const friendsRewards = [
  { title: "Invite 3 friends", referralsRequired: 3, bonusAward: 15000 },
  { title: "Invite 5 friends", referralsRequired: 5, bonusAward: 25000 },
  { title: "Invite 10 friends", referralsRequired: 10, bonusAward: 50000 },
  { title: "Invite 25 friends", referralsRequired: 25, bonusAward: 500000 },
  { title: "Invite 50 friends", referralsRequired: 50, bonusAward: 1000000 },
  { title: "Invite 100 friends", referralsRequired: 100, bonusAward: 2000000 },
];

const ReferralRewards = () => {
  const { referrals, balance, setBalance, id, level, refBonus } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [congrats, setCongrats] = useState(false);
  const [activeIndex, setActiveIndex] = useState(1);
  const [showLevel, setShowLevel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [totalSignedUp, setTotalSignedUp] = useState(0);
  const [claimedLevels, setClaimedLevels] = useState([]);

  const handleClaim = async (reward) => {
    if (claiming) return;

    try {
      setClaiming(true);
      const result = await handleClaimReferralRewards(
        id,
        reward.referralsRequired
      );

      if (result.success) {
        // Update local state
        setBalance((prev) => prev + result.reward);
        setClaimedLevels((prev) => [...prev, result.claimedLevel]);
        setClaimedRewards((prev) => [...prev, reward.title]);

        setModalMessage(
          <div className="w-full flex justify-center flex-col items-center space-y-3">
            <div className="w-full items-center justify-center flex flex-col space-y-2">
              <IoCheckmarkCircleSharp size={32} className="text-accent" />
              <p className="font-medium text-center">Great job!</p>
            </div>
            <h3 className="font-medium text-[20px] text-[#ffffff] pt-2 pb-2">
              <span className="text-accent">
                +{formatNumber(result.reward)}
              </span>{" "}
              SHAKA CLAIMED
            </h3>
            <p className="pb-6 text-[#bfbfbf] text-[15px] w-full text-center">
              {result.remainingCount > 0
                ? `${result.remainingCount} more referrals available to claim!`
                : "All referrals claimed! Keep inviting friends for more rewards!"}
            </p>
          </div>
        );

        setModalOpen(true);
        setCongrats(true);

        setTimeout(() => {
          setCongrats(false);
        }, 4000);
      } else {
        setModalMessage(result.message);
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Error claiming rewards:", error);
      setModalMessage("Failed to claim rewards. Please try again.");
      setModalOpen(true);
    } finally {
      setClaiming(false);
    }
  };

  const formatNumber = (number) => {
    if (number === undefined || number === null || isNaN(number)) {
      return "";
    }

    if (number >= 1000000) {
      return (number / 1000000).toFixed() + "M";
    } else if (number >= 100000) {
      return (number / 1000).toFixed(0) + "K";
    } else {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleMenu = (index) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    // Show the back button when the component mounts
    window.Telegram.WebApp.BackButton.show();

    // Attach a click event listener to handle the back navigation
    const handleBackButtonClick = () => {
      window.history.back();
    };

    window.Telegram.WebApp.BackButton.onClick(handleBackButtonClick);

    // Clean up the event listener and hide the back button when the component unmounts
    return () => {
      window.Telegram.WebApp.BackButton.offClick(handleBackButtonClick);
      window.Telegram.WebApp.BackButton.hide();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (id && friendsRewards) {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [id, friendsRewards]);

  useEffect(() => {
    if (!id || !friendsRewards) {
      setError("Failed to load rewards data");
    }
  }, [id, friendsRewards]);

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!id) return;

      try {
        const referralRef = doc(db, "referrals", id);
        const referralDoc = await getDoc(referralRef);

        if (referralDoc.exists()) {
          const data = referralDoc.data();
          setClaimedLevels(data.claimedLevels || []);
          setClaimedRewards(data.claimedRewards || []);
          setTotalSignedUp(data.usersSignedUp?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching referral data:", error);
      }
    };

    fetchReferralData();
  }, [id]);

  const renderLoadingState = () => (
    <div className="w-full h-[200px] flex items-center justify-center flex-col space-y-3">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FBC535]"></div>
      <p className="text-[14px] text-[#8a8a8a]">Loading rewards...</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="w-full h-[200px] flex items-center justify-center flex-col space-y-4">
      <div className="text-center">
        <h3 className="text-[18px] font-medium text-accent">
          {error || "Something went wrong"}
        </h3>
        <p className="text-[14px] text-[#666666] mt-2 mb-4">
          We couldn't load the rewards. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-btn4 rounded-[6px] text-[14px]"
        >
          Retry
        </button>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="w-full h-[200px] flex items-center justify-center flex-col space-y-4">
      <img
        src="/empty-box.png"
        alt="No rewards"
        className="w-[80px] opacity-50"
      />
      <div className="text-center">
        <h3 className="text-[18px] font-medium text-[#8a8a8a]">
          No Rewards Available
        </h3>
        <p className="text-[14px] text-[#666666]">
          Check back later for new rewards to earn
        </p>
      </div>
    </div>
  );

  const renderHeader = () => (
    <div className="w-full flex justify-between items-center">
      <button
        onClick={() => setShowLevel(true)}
        className="w-[55%] flex space-x-1 items-center"
      >
        <span className="flex items-center justify-center">
          <img
            alt="engy"
            src={level.imgUrl}
            className="w-[14px] rounded-full h-full"
          />
        </span>
        <span className="font-medium text-[13px] text-secondary flex items-center space-x-1">
          <span className="">{level.name}</span>
          <span className="flex items-center">
            <RiArrowRightSLine size={16} className="" />
          </span>
        </span>
      </button>

      <div className="flex items-center space-x-3">
        {/* Total Signed Up Users Counter */}
        <div className="flex items-center space-x-1 bg-cards3 px-3 py-1 rounded-full">
          <PiUsersThreeFill size={14} className="text-accent" />
          <span className="text-[13px] font-medium">{totalSignedUp}</span>
        </div>

        <div className="w-fit py-[2px] px-3 flex items-center space-x-1 justify-center border-[1px] border-[#707070] rounded-[25px]">
          <span className="w-[14px]">
            <img alt="engy" src="/loader.webp" className="w-full" />
          </span>
          <h1 className="text-[15px] font-bold">
            {formatNumber(balance + refBonus)}
          </h1>
        </div>
      </div>
    </div>
  );

  const renderRewardsContent = () => {
    if (isLoading) return renderLoadingState();
    if (error) return renderErrorState();
    if (!friendsRewards || friendsRewards.length === 0)
      return renderEmptyState();

    return (
      <>
        {friendsRewards
          .filter((reward) => !claimedLevels.includes(reward.referralsRequired))
          .map((reward) => {
            const progress = totalSignedUp
              ? (totalSignedUp / reward.referralsRequired) * 100
              : 0;
            const isClaimable =
              totalSignedUp >= reward.referralsRequired &&
              !claimedLevels.includes(reward.referralsRequired);

            return (
              <div
                key={reward.title}
                className="bg-cards w-full rounded-[15px] p-[14px] flex flex-wrap justify-between items-center"
              >
                <div className="flex flex-1 items-center space-x-2">
                  <div className="">
                    <img
                      src="/frens2.jpg"
                      alt="bonuses"
                      className="w-[55px] rounded-[8px]"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="font-semibold">{reward.title}</span>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">
                        {formatNumber(reward.bonusAward)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="">
                  <button
                    className={`w-fit relative rounded-[8px] font-semibold py-2 px-3 ${
                      isClaimable
                        ? "bg-btn4 text-[#000] hover:bg-[#b4b4b4] ease-in duration-200"
                        : "bg-[#0000004a] text-[#888] cursor-not-allowed"
                    }`}
                    disabled={!isClaimable || claiming}
                    onClick={() => handleClaim(reward)}
                  >
                    {claiming ? "Claiming..." : "Claim"}
                  </button>
                </div>

                <div className="flex w-full mt-2 p-[4px] items-center bg-energybar rounded-[10px] border-[1px] border-borders2">
                  <div
                    className={`h-[8px] rounded-[8px] ${
                      progress >= 100 ? "bg-[#be8130]" : "bg-[#be8130]"
                    }`}
                    style={{ width: `${progress > 100 ? 100 : progress}%` }}
                  />
                </div>
              </div>
            );
          })}
      </>
    );
  };

  return (
    <ErrorBoundary>
      <Animate>
        <div className="w-full pt-2 justify-center flex-col space-y-6 px-5">
          {renderHeader()}

          <div
            onClick={() => handleMenu(1)}
            className={`${
              activeIndex === 1 ? "bg-cards3 text-[#ebebeb]" : ""
            }  rounded-[6px] text-[#c6c6c6] py-[10px] text-nowrap barTitle px-3  flex space-x-2 justify-center text-center text-[15px] font-semibold items-center`}
          >
            <PiUsersThreeFill size={16} className="" />
            <span>Ref rewards</span>
          </div>

          <div id="refer" className="w-full  rounded-[10px]  pt-2 pb-[180px]">
            <div
              className={`${
                activeIndex === 1 ? "block" : "hidden"
              } w-full flex items-end justify-center flex-col space-y-4`}
            >
              {renderRewardsContent()}

              <div className="w-full absolute top-[50px] left-0 right-0 flex justify-center z-50 pointer-events-none select-none">
                {congrats ? (
                  <img src="/congrats.gif" alt="congrats" className="w-[80%]" />
                ) : null}
              </div>

              <div
                className={`${
                  modalOpen === true ? "visible" : "invisible"
                } fixed top-[-12px] bottom-0 left-0 z-40 right-0 h-[100vh] bg-[#00000042] flex justify-center items-center backdrop-blur-[6px] px-4`}
              >
                <div
                  className={`${
                    modalOpen === true
                      ? "opacity-100 mt-0"
                      : "opacity-0 mt-[100px]"
                  } w-full bg-modal relative rounded-[16px] flex flex-col justify-center p-8 ease-in duration-300 transition-all`}
                >
                  {modalMessage}
                  <div className="w-full flex justify-center">
                    <button
                      onClick={closeModal}
                      className="bg-btn4 w-fit py-[10px] px-6 flex items-center justify-center text-center rounded-[12px] font-medium text-[16px]"
                    >
                      Continue to next
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Levels showLevel={showLevel} setShowLevel={setShowLevel} />
          </div>
        </div>
      </Animate>
    </ErrorBoundary>
  );
};

export default ReferralRewards;
