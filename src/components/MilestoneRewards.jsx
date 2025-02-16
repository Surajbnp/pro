import React, { useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { useUser } from "../context/userContext";
import { IoCheckmarkCircleSharp } from "react-icons/io5";

const milestones = [
  {
    name: "Bronze",
    icon: "/bronze.webp",
    tapBalanceRequired: 1000,
    reward: 50000,
  },
  {
    name: "Silver",
    icon: "/silver.webp",
    tapBalanceRequired: 50000,
    reward: 100000,
  },
  {
    name: "Gold",
    icon: "/gold.webp",
    tapBalanceRequired: 500000,
    reward: 250000,
  },
  {
    name: "Platinum",
    icon: "/platinum.webp",
    tapBalanceRequired: 1000000,
    reward: 500000,
  },
  {
    name: "Diamond",
    icon: "/diamond.webp",
    tapBalanceRequired: 2500000,
    reward: 1000000,
  },
  {
    name: "Master",
    icon: "/master.webp",
    tapBalanceRequired: 5000000,
    reward: 2500000,
  },
];

const MilestoneRewards = () => {
  const {
    tapBalance,
    balance,
    setBalance,
    id,
    claimedMilestones,
    setClaimedMilestones,
    level,
    setLevel,
    updateUserData,
  } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [congrats, setCongrats] = useState(false);

  const handleClaim = async (milestone) => {
    if (!milestone) {
      console.error("Invalid milestone");
      setModalMessage("Something went wrong. Please try again.");
      setModalOpen(true);
      return;
    }

    // Initialize claimedMilestones as empty array if undefined
    const currentClaimedMilestones = claimedMilestones || [];

    if (
      tapBalance >= milestone.tapBalanceRequired &&
      !currentClaimedMilestones.includes(milestone.name)
    ) {
      const newBalance = balance + milestone.reward;

      // Create new level object based on milestone
      const newLevel = {
        id: milestones.findIndex((m) => m.name === milestone.name) + 1,
        name: milestone.name,
        imgUrl: milestone.icon,
      };

      try {
        const success = await updateUserData({
          balance: newBalance,
          claimedMilestones: [...currentClaimedMilestones, milestone.name],
          level: newLevel,
        });

        if (success) {
          setBalance(newBalance);
          setClaimedMilestones([...currentClaimedMilestones, milestone.name]);
          setLevel(newLevel);

          setModalMessage(
            <div className="w-full flex justify-center flex-col items-center space-y-3">
              <div className="w-full items-center justify-center flex flex-col space-y-2">
                <IoCheckmarkCircleSharp size={32} className="text-accent" />
                <p className="font-medium text-center">Let's go!!</p>
              </div>
              <h3 className="font-medium text-[20px] text-[#ffffff] pt-2 pb-2">
                <span className="text-accent">
                  +{formatNumberCliam(milestone.reward)}
                </span>{" "}
                SHAKA CLAIMED
              </h3>
              <p className="pb-6 text-[#bfbfbf] text-[15px] w-full text-center">
                Keep tapping and performing tasks to unlock new milestones!
                something huge is coming!
              </p>
            </div>
          );

          setModalOpen(true);
          setCongrats(true);

          setTimeout(() => {
            setCongrats(false);
          }, 4000);
        }
      } catch (error) {
        console.error("Error claiming milestone reward:", error);
      }
    } else {
      setModalMessage(
        "You have already claimed this milestone reward or do not meet the requirements."
      );
      setModalOpen(true);
    }
  };

  const formatNumberCliam = (num) => {
    if (num < 100000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    } else if (num < 1000000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    } else if (num < 10000000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    } else {
      return (num / 10000000).toFixed(3).replace(".", ".") + " T";
    }
  };
  const closeModal = () => {
    setModalOpen(false);
  };

  if (!milestones?.length) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center flex-col space-y-4">
        <img
          src="/empty-milestone.png"
          alt="No milestones"
          className="w-[80px] opacity-50"
        />
        <div className="text-center">
          <h3 className="text-[18px] font-medium text-[#8a8a8a]">
            No Milestones Available
          </h3>
          <p className="text-[14px] text-[#666666]">
            Keep tapping to unlock milestones!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-4">
      {milestones
        ?.filter((milestone) => !claimedMilestones?.includes(milestone.name))
        .map((milestone) => {
          const progress = (tapBalance / milestone.tapBalanceRequired) * 100;
          const isClaimable =
            tapBalance >= milestone.tapBalanceRequired &&
            !claimedMilestones?.includes(milestone.name);

          if (!milestone) return null;

          return (
            <div
              key={milestone.name}
              className="w-[93%] rounded-[25px] bg-gradient-to-r from-[#454545] to-[#575349] p-[1px]"
            >
              <div className="flex h-full w-full flex-col bg-[#2d2d2d] justify-center rounded-[24px] py-4 px-4 relative">
                <div className="flex items-center gap-4">
                  <div className="w-[60px] h-[60px] rounded-[12px] p-2 bg-[#6b69699c] flex items-center justify-center">
                    <img
                      alt={milestone.name}
                      src={milestone.icon}
                      className="w-[40px]"
                    />
                  </div>

                  <div className="flex w-full flex-col justify-between h-full space-y-2">
                    <h1 className="text-[15px] text-nowrap line-clamp-1 mr-[5px] font-medium">
                      {milestone.name}
                    </h1>
                    <span className="flex text-primary items-center w-fit space-x-1 text-[14px] font-semibold">
                      <span className="w-[10px] h-[10px] bg-[#be8130] rounded-full flex items-center"></span>
                      <span className="">
                        {formatNumberCliam(milestone.reward)}
                      </span>
                    </span>

                    <div className="w-full flex items-center justify-between flex-wrap text-[14px] relative">
                      <button
                        className={`w-fit relative rounded-[8px] font-semibold py-2 px-3 ${
                          isClaimable
                            ? "bg-btn4 text-[#000] hover:bg-[#b4b4b4] ease-in duration-200"
                            : "bg-[#0000004a] text-[#888] cursor-not-allowed"
                        }`}
                        disabled={!isClaimable}
                        onClick={() => handleClaim(milestone)}
                      >
                        {isClaimable ? "Claim" : "Claim"}
                      </button>

                      <div className="flex w-full mt-2 p-[4px] items-center bg-energybar rounded-[10px] border-[1px] border-borders2">
                        <div
                          className={`h-[8px] rounded-[8px] ${
                            progress >= 100 ? "bg-[#be8130]" : "bg-[#be8130]"
                          }`}
                          style={{
                            width: `${progress > 100 ? 100 : progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

      {/* Show message when all milestones are claimed */}
      {milestones?.length > 0 &&
        milestones.every((milestone) =>
          claimedMilestones?.includes(milestone.name)
        ) && (
          <div className="w-full h-[200px] flex items-center justify-center flex-col space-y-4">
            <div className="text-center">
              <IoCheckmarkCircleSharp
                size={40}
                className="text-accent mx-auto mb-4"
              />
              <h3 className="text-[18px] font-medium text-[#8a8a8a]">
                All Milestones Completed!
              </h3>
              <p className="text-[14px] text-[#666666]">
                Great job! You've claimed all available milestones.
              </p>
            </div>
          </div>
        )}

      {/* Modal and congrats animation */}
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
            modalOpen === true ? "opacity-100 mt-0" : "opacity-0 mt-[100px]"
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
  );
};

export default MilestoneRewards;
