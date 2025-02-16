import React, { useEffect, useState, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { PiHandTap, PiTimerDuotone } from "react-icons/pi";
import {
  IoCheckmarkCircleSharp,
  IoClose,
  IoLogOutOutline,
} from "react-icons/io5";
import Animate from "../components/Animate";
import Spinner from "../components/Spinner";
import { RiArrowRightSLine } from "react-icons/ri";
import { useUser } from "../context/userContext";
import Levels from "../components/Levels";
import Exchanges from "../components/Exchanges";
import { PiInfoFill } from "react-icons/pi";
import { RiSettings4Fill } from "react-icons/ri";
import { FaHeart } from "react-icons/fa";
import SettingsMenu from "../components/SettingsMenu";
import toast from "react-hot-toast";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import LoginForm from "../components/LoginForm";
import { getStakingRewardMultiplier } from "../services/stakingService";

const userLevels = [
  { id: 1, name: "Bronze", icon: "/bronze.webp", tapBalanceRequired: 1000 },
  { id: 2, name: "Silver", icon: "/silver.webp", tapBalanceRequired: 50000 },
  { id: 3, name: "Gold", icon: "/gold.webp", tapBalanceRequired: 500000 },
  {
    id: 4,
    name: "Platinum",
    icon: "/platinum.webp",
    tapBalanceRequired: 1000000,
  },
  {
    id: 5,
    name: "Diamond",
    icon: "/diamond.webp",
    tapBalanceRequired: 2500000,
  },
  { id: 6, name: "Master", icon: "/master.webp", tapBalanceRequired: 5000000 },
];

const slideUp = keyframes`
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-350px);
  }
`;

const SlideUpText = styled.div`
  position: absolute;
  animation: ${slideUp} 3s ease-out;
  font-size: 2.1em;
  color: #ffffffa6;
  font-weight: 600;
  left: ${({ x }) => x}px;
  top: ${({ y }) => y}px;
  pointer-events: none; /* To prevent any interaction */
`;

const Container = styled.div`
  position: relative;
  display: flex;
  text-align: center;
  justify-content: center;
  width: 100%;
`;

const characters = [
  {
    name: "boy",
    avatar: "/boy.webp",
  },
  {
    name: "girl",
    avatar: "/girl.webp",
  },
];

const GoldHunters = () => {
  const imageRef = useRef(null);
  const [clicks, setClicks] = useState([]);
  const {
    balance,
    tapBalance,
    energy,
    battery,
    coolDownTime,
    tappingGuru,
    selectedCharacter,
    fullName,
    setFullName,
    id,
    claimExchangePoint,
    setClaimExchangePoint,
    tapGuru,
    mainTap,
    selectedExchange,
    setEnergy,
    tapValue,
    setTapBalance,
    setBalance,
    refBonus = 0,
    loading,
    initialized,
    handleWebSignup,
    updateProfile,
    showAuthForm,
    setShowAuthForm,
    updateTelegramProfile,
    telegramUser,
    characterSelect,
    setCharacterSelect,
    handleLogout,
    updateUserData,
    level,
  } = useUser();
  const [points, setPoints] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [openClaim, setOpenClaim] = useState(false);
  const exchangeRef = useRef(null);
  const [congrats, setCongrats] = useState(false);
  const [glowBooster, setGlowBooster] = useState(false);
  const [showLevel, setShowLevel] = useState(false);
  const [showExchange, setShowExchange] = useState(false);
  const [showSetting, setShowSetting] = useState(false);
  const [exchangePoints, setExchangePoints] = useState(0);
  const [fullNameSelect, setFullNameSelect] = useState(false);
  const [selectedCharacterOne, setSelectedCharacterOne] = useState({
    name: "",
    avatar: "",
  });
  const [bonusInfo, setBonusInfo] = useState(null);
  // const fullNameOn = toString(firstName + lastName)
  const [error, setError] = useState("");
  const [authStep, setAuthStep] = useState("credentials");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    username: "",
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Default to login view
  const ENERGY_RESET_VALUE = 500; // Constant for reset value
  const COOLDOWN_TIME = 60000; // 1 minute in milliseconds

  const awardPoints = () => {
    const savedTime = localStorage.getItem("currentTime");
    if (savedTime) {
      const now = new Date();
      const savedDate = new Date(savedTime);

      const elapsedTime = (now - savedDate) / 1000; // Time difference in seconds
      const pointsToAward = elapsedTime * 0.8; // Points per second

      setExchangePoints(
        (prevExchangePoints) => prevExchangePoints + pointsToAward
      );
    }
  };

  const claimExchangePoints = async (event) => {
    if (exchangeRef.current && !exchangeRef.current.contains(event.target)) {
      const now = new Date();
      localStorage.setItem("currentTime", now.toISOString());
      const exchangeUpdated = Math.floor(exchangePoints);
      const newBalance = balance + exchangeUpdated;

      const success = await updateUserData({
        balance: newBalance,
        tapBalance: tapBalance + exchangeUpdated,
      });

      if (success) {
        setBalance(newBalance);
        setTapBalance(tapBalance + exchangeUpdated);
        animateBalanceUpdate(newBalance);
        setClaimExchangePoint(false);
        setCongrats(true);

        setTimeout(() => {
          setCongrats(false);
        }, 4000);
      }
    }
  };

  const animateBalanceUpdate = (newBalance) => {
    const animationDuration = 300; // Animation duration in milliseconds
    const updateInterval = 20; // Update every 20 milliseconds
    const totalSteps = animationDuration / updateInterval;
    const increment = (newBalance - balance) / totalSteps; // Calculate increment per step
    let currentBalance = balance;
    let stepCount = 0;

    const intervalId = setInterval(() => {
      currentBalance += increment;
      stepCount += 1;
      if (stepCount >= totalSteps) {
        clearInterval(intervalId);
        currentBalance = newBalance;
      }
      setBalance(Math.floor(currentBalance.toFixed(0)));
    }, updateInterval);
  };

  const claimExchange = async () => {
    const now = new Date();
    localStorage.setItem("currentTime", now.toISOString());
    const exchangeUpdated = Math.floor(exchangePoints); // Convert to integer
    const newBalance = balance + exchangeUpdated;
    const userRef = doc(db, "telegramUsers", id.toString());
    try {
      await updateDoc(userRef, {
        balance: newBalance,
        tapBalance: tapBalance + exchangeUpdated,
      });
      setBalance(newBalance);
      setTapBalance(tapBalance + exchangeUpdated);
      animateBalanceUpdate(newBalance); // Animate the balance update
      setClaimExchangePoint(false);
      setCongrats(true);

      setTimeout(() => {
        setCongrats(false);
      }, 4000);
    } catch (error) {
      console.error("Error updating balance exchanges", error);
    }
  };

  useEffect(() => {
    awardPoints();
  }, []);

  useEffect(() => {
    if (id) {
      if (claimExchangePoint) {
        document.addEventListener("mousedown", claimExchangePoints);
      } else {
        document.removeEventListener("mousedown", claimExchangePoints);
      }

      return () => {
        document.removeEventListener("mousedown", claimExchangePoints);
      };
    }
  }, [claimExchangePoint, id]);

  function triggerHapticFeedback() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (
      isIOS &&
      window.Telegram &&
      window.Telegram.WebApp &&
      window.Telegram.WebApp.HapticFeedback
    ) {
      console.log("Triggering iOS haptic feedback");
      window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");
    } else if (isAndroid) {
      console.log("Android device detected");
      if ("vibrate" in navigator) {
        console.log("Vibration API supported, triggering haptic feedback");
        navigator.vibrate(50); // Vibrate for 50ms
      } else {
        console.warn("Vibration API not supported on this Android device");
      }
    } else {
      console.warn("Haptic feedback not supported on this device");
    }
  }

  const handleClick = (e) => {
    triggerHapticFeedback();
    if (energy <= 0 || isDisabled) {
      setGlowBooster(true);
      setTimeout(() => {
        setGlowBooster(false);
      }, 300);
      return;
    }

    const { offsetX, offsetY, target } = e.nativeEvent;
    const { clientWidth, clientHeight } = target;

    const horizontalMidpoint = clientWidth / 2;
    const verticalMidpoint = clientHeight / 2;

    const animationClass =
      offsetX < horizontalMidpoint
        ? "wobble-left"
        : offsetX > horizontalMidpoint
        ? "wobble-right"
        : offsetY < verticalMidpoint
        ? "wobble-top"
        : "wobble-bottom";

    // Remove previous animations
    imageRef.current.classList.remove(
      "wobble-top",
      "wobble-bottom",
      "wobble-left",
      "wobble-right"
    );

    // Add the new animation class
    imageRef.current.classList.add(animationClass);

    // Remove the animation class after animation ends to allow re-animation on the same side
    setTimeout(() => {
      imageRef.current.classList.remove(animationClass);
    }, 500); // duration should match the animation duration in CSS

    // Increment the count
    const rect = e.target.getBoundingClientRect();
    const newClick = {
      id: Date.now(), // Unique identifier
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setClicks((prevClicks) => [...prevClicks, newClick]);
    setEnergy((prevEnergy) => {
      const newEnergy = prevEnergy - tapValue.value;
      if (newEnergy <= 0) {
        // Set a timer for 1 minute
        const endTime = new Date(new Date().getTime() + COOLDOWN_TIME);
        localStorage.setItem("endTime", endTime);
        localStorage.setItem("energy", "0");
        setIsDisabled(true);
        setIsTimerVisible(true);

        const timer = setInterval(() => {
          const newTimeLeft = new Date(endTime) - new Date();
          if (newTimeLeft <= 0) {
            clearInterval(timer);
            localStorage.removeItem("endTime");
            setIsDisabled(false);
            setIsTimerVisible(false);
            setEnergy(ENERGY_RESET_VALUE); // Reset to 500
            localStorage.setItem("energy", ENERGY_RESET_VALUE.toString());
          } else {
            setTimeRemaining(newTimeLeft);
          }
        }, 1000);
        return 0;
      }
      localStorage.setItem("energy", newEnergy.toString());
      return Math.max(newEnergy, 0);
    });
    setPoints((prevPoints) => prevPoints + tapValue.value);

    if (points === 20) {
      const taps = document.getElementById("tapmore");
      taps.style.display = "block";
      setTimeout(() => {
        taps.style.display = "none";
      }, 2000);
    }
    if (points === 80) {
      const taps = document.getElementById("tapmore2");
      taps.style.display = "block";
      setTimeout(() => {
        taps.style.display = "none";
      }, 2000);
    }
    if (points === 150) {
      const taps = document.getElementById("tapmore3");
      taps.style.display = "block";
      setTimeout(() => {
        taps.style.display = "none";
      }, 2000);
    }

    // Remove the click after the animation duration
    setTimeout(() => {
      setClicks((prevClicks) =>
        prevClicks.filter((click) => click.id !== newClick.id)
      );
    }, 1000); // Match this duration with the animation duration
  };

  const handleClickGuru = (e) => {
    triggerHapticFeedback();

    const { offsetX, offsetY, target } = e.nativeEvent;
    const { clientWidth, clientHeight } = target;

    const horizontalMidpoint = clientWidth / 2;
    const verticalMidpoint = clientHeight / 2;

    const animationClass =
      offsetX < horizontalMidpoint
        ? "wobble-left"
        : offsetX > horizontalMidpoint
        ? "wobble-right"
        : offsetY < verticalMidpoint
        ? "wobble-top"
        : "wobble-bottom";

    // Remove previous animations
    imageRef.current.classList.remove(
      "wobble-top",
      "wobble-bottom",
      "wobble-left",
      "wobble-right"
    );

    // Add the new animation class
    imageRef.current.classList.add(animationClass);

    // Remove the animation class after animation ends to allow re-animation on the same side
    setTimeout(() => {
      imageRef.current.classList.remove(animationClass);
    }, 500); // duration should match the animation duration in CSS

    // Increment the count
    const rect = e.target.getBoundingClientRect();
    const newClick = {
      id: Date.now(), // Unique identifier
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setClicks((prevClicks) => [...prevClicks, newClick]);
    setEnergy((prevEnergy) => {
      const newEnergy = prevEnergy - 0;
      if (newEnergy <= 0) {
        // Set a timer for 1 minute
        const endTime = new Date(new Date().getTime() + coolDownTime);
        localStorage.setItem("endTime", endTime);
        localStorage.setItem("energy", newEnergy);
        setIsDisabled(true);
        const timer = setInterval(() => {
          const newTimeLeft = new Date(endTime) - new Date();
          if (newTimeLeft <= 0) {
            clearInterval(timer);
            localStorage.removeItem("endTime");
            setIsDisabled(false);
            setIsTimerVisible(false);
            setEnergy(battery.energy);
          } else {
            setTimeRemaining(newTimeLeft);
          }
        }, 1000);
        return 0; // Ensure energy does not drop below 0
      }
      return Math.max(newEnergy, 0); // Ensure energy does not drop below 0
    });
    setPoints((prevPoints) => prevPoints + tapValue.value * tappingGuru);

    if (points === 20) {
      const taps = document.getElementById("tapmore");
      taps.style.display = "block";
      setTimeout(() => {
        taps.style.display = "none";
      }, 2000);
    }
    if (points === 80) {
      const taps = document.getElementById("tapmore2");
      taps.style.display = "block";
      setTimeout(() => {
        taps.style.display = "none";
      }, 2000);
    }
    if (points === 150) {
      const taps = document.getElementById("tapmore3");
      taps.style.display = "block";
      setTimeout(() => {
        taps.style.display = "none";
      }, 2000);
    }

    // Remove the click after the animation duration
    setTimeout(() => {
      setClicks((prevClicks) =>
        prevClicks.filter((click) => click.id !== newClick.id)
      );
    }, 1000); // Match this duration with the animation duration
  };

  const handleClaim = async () => {
    // Get the staking reward multiplier
    const multiplier = await getStakingRewardMultiplier(id);

    // Calculate points with multiplier
    const adjustedPoints = Math.floor(points * multiplier);
    const bonusPoints = adjustedPoints - points;
    const newBalance = balance + adjustedPoints;
    const newTapBalance = tapBalance + adjustedPoints;

    // First show the animations with bonus information
    openClaimer();
    setBonusInfo({
      basePoints: points,
      bonusPoints: bonusPoints,
      hasStaking: multiplier > 1,
    });

    // Wait for a short delay to let animations start
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Then update the values
    const success = await updateUserData({
      balance: newBalance,
      tapBalance: newTapBalance,
      energy: energy,
    });

    if (!success) {
      // If update fails, show error
      toast.error("Failed to update balance");
    }
  };

  const openClaimer = (bonusInfo) => {
    setOpenClaim(true);
    setCongrats(true);

    setTimeout(() => {
      setCongrats(false);
    }, 4000);
  };

  const closeClaimer = () => {
    setOpenClaim(false);
    setPoints(0); // Reset points after claiming
  };

  useEffect(() => {
    const savedEndTime = localStorage.getItem("endTime");
    if (savedEndTime) {
      const endTime = new Date(savedEndTime);
      const newTimeLeft = endTime - new Date();
      if (newTimeLeft > 0) {
        setIsDisabled(true);
        setIsTimerVisible(true);
        setTimeRemaining(newTimeLeft);
        const timer = setInterval(() => {
          const updatedTimeLeft = endTime - new Date();
          if (updatedTimeLeft <= 0) {
            clearInterval(timer);
            localStorage.removeItem("endTime");
            setIsDisabled(false);
            setIsTimerVisible(false);
            setEnergy(battery.energy);
          } else {
            setTimeRemaining(updatedTimeLeft);
          }
        }, 1000);
      } else {
        localStorage.removeItem("endTime");
      }
    }
  }, []);

  useEffect(() => {
    if (initialized) {
      const savedEnergy = localStorage.getItem("energy");
    }
  }, [timeRemaining, energy, initialized]);

  const formatTimeRemaining = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatNumber = (num) => {
    if (num < 100000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    } else if (num < 1000000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    } else {
      return (num / 1000000).toFixed(3).replace(".", ".") + " M";
    }
  };

  const handleCharacterSelect = async (character) => {
    try {
      setSelectedCharacterOne(character);
      setCharacterSelect(false);
      setFullNameSelect(true);
      toast.success("Character selected! Now enter your name.");
    } catch (error) {
      console.error("Error selecting character:", error);
      toast.error("Failed to select character");
      setCharacterSelect(true);
    }
  };

  const handleSaveFullName = async () => {
    if (!fullName.trim()) {
      setError("Enter a name to proceed");
      return;
    }

    try {
      const profileData = {
        fullName: fullName,
        character: selectedCharacterOne,
      };

      // Use appropriate update function based on user type
      const success = telegramUser
        ? await updateTelegramProfile(profileData)
        : await updateProfile(profileData);

      if (success) {
        setFullNameSelect(false);
        setCharacterSelect(false);
        setCongrats(true);
        setTimeout(() => {
          setCongrats(false);
        }, 4000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setError("Failed to save profile. Please try again.");
      toast.error("Failed to save profile");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setAuthLoading(true);
      const auth = getAuth();
      const { user } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Initialize user in database with basic data
      const userData = {
        userId: user.uid,
        email: formData.email,
      };

      const result = await handleWebSignup(userData);

      if (result.success) {
        setShowAuthForm(false); // Hide auth form
        setCharacterSelect(true); // Show character selection
        toast.success("Account created! Please select your character.");
      } else {
        throw new Error("Failed to initialize user data");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setAuthLoading(false);
    }
  };
  if (showAuthForm) {
    return (
      <div className="w-full  flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#202020] rounded-[20px] p-6 space-y-6">
          {isLogin ? (
            <LoginForm
              setShowAuthForm={setShowAuthForm}
              onToggleAuth={() => setIsLogin(false)}
            />
          ) : authStep === "credentials" ? (
            <form onSubmit={handleEmailSignup} className="space-y-6">
              <h2 className="text-[24px] font-medium text-center text-white">
                Create Your Account
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[14px] text-[#dedede]">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-[#303030] text-white rounded-[12px] p-3 focus:outline-none"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[14px] text-[#dedede]">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-[#303030] text-white rounded-[12px] p-3 focus:outline-none"
                    placeholder="Create a password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className={`w-full ${
                    authLoading ? "bg-[#404040]" : "bg-btn4"
                  } text-black font-medium rounded-[12px] p-3 flex items-center justify-center`}
                >
                  {authLoading ? (
                    <span className="flex items-center">
                      Creating Account...
                      <AiOutlineLoading3Quarters className="ml-2 animate-spin" />
                    </span>
                  ) : (
                    "Continue"
                  )}
                </button>
                <div className="text-center text-[14px] text-[#dedede]">
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="text-btn4 hover:underline"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </div>
            </form>
          ) : (
            <></>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <Animate>
          <div className="w-full flex justify-center flex-col">
            <div className="w-full flex items-center justify-between px-5 pb-3">
              <Link
                to="/user-profile"
                className="flex items-center space-x-[6px] hover:bg-cards3 px-3 py-2 rounded-[8px] text-[11px] font-medium hover:bg-[#3a3a3a] transition-colors"
              >
                <div className="w-[30px] h-[30px]  rounded-full">
                  <img
                    src={selectedCharacter.avatar || "/boy.webp"}
                    className="w-[25px] h-[25px] object-contain rounded-full"
                    alt={fullName || "user"}
                  />
                </div>
                <h1 className="text-[11px] font-semibold">{fullName} (CEO)</h1>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-cards3 px-3 py-2 rounded-[8px] text-[11px] font-medium hover:bg-[#3a3a3a] transition-colors"
              >
                <IoLogOutOutline size={16} />
                <span>Logout</span>
              </button>
            </div>

            <div className="w-full flex justify-between items-center px-4 z-10 pb-3 pt-1">
              <div className="w-[32%] flex flex-col space-y-1 pr-4">
                <div className="w-full flex justify-between text-[10px] font-medium items-center">
                  <span className="levelName flex items-center">
                    <span onClick={() => setShowLevel(true)} className="">
                      {level.name}
                    </span>
                    <span className="flex items-center">
                      {" "}
                      <RiArrowRightSLine size={12} className="mt-[1px]" />{" "}
                    </span>
                  </span>

                  <span className="">
                    {level.id}/{userLevels.length}
                  </span>
                </div>

                <div className="flex w-full mt-2 items-center rounded-[10px] border-[1px] border-[#49494952] bg-[#303030]">
                  <div
                    className={`h-[6px] rounded-[8px] levelbar`}
                    style={{
                      width: `${level.currentProgress || 0}%`,
                    }}
                  />
                </div>
                {level.nextLevel && (
                  <div className="text-[9px] text-[#dedede] pt-1">
                    {formatNumber(level.nextLevel.remainingBalance)} SHAKA
                    needed for {level.nextLevel.name}
                  </div>
                )}
              </div>

              <div className="flex w-[60%] bg-[#5c5c5c52] border-[1px] border-[#434343] h-[40px] mb-[-4px] py-3 px-3 rounded-full items-center">
                <button onClick={() => setShowExchange(true)} className="">
                  <img
                    id={selectedExchange.id}
                    src={selectedExchange.icon}
                    alt={selectedExchange.name}
                    className={`w-[22px]`}
                  />
                </button>

                <div className="w-[1px] h-[18px] mx-[10px] bg-divider2" />
                <div className="flex flex-1 flex-col space-y-1 items-center justify-center">
                  <p className="text-[9px]">Profit per tap</p>
                  <div className="flex items-center justify-center space-x-1 text-[11px]">
                    <span className="flex items-center justify-center">
                      <img src="/coin.webp" alt="ppf" className="w-[12px]" />
                    </span>
                    <span className="font-bold">+{tapValue.value}</span>
                    <span className="flex items-center justify-center">
                      <PiInfoFill size={14} className="text-info" />
                    </span>
                  </div>
                </div>

                <div className="w-[1px] h-[18px] mx-[10px] bg-divider2" />

                <button onClick={() => setShowSetting(true)} className="">
                  <RiSettings4Fill size={20} className="" />
                </button>
              </div>
            </div>
            <div className="w-full relative h-screen bg-divider shadowtop rounded-tl-[40px] rounded-tr-[40px]">
              <div
                id="refer"
                className="w-full h-screen homescreen rounded-tl-[40px] rounded-tr-[40px] mt-[2px] px-5"
              >
                <div className="w-full flex flex-col  pb-[150px]">
                  <div className="w-full flex items-center justify-center space-x-5 py-6">
                    <div className="bg-cards3 text-[#dddddd] py-[15px] px-5 w-[45%] flex justify-center space-x-1 items-center rounded-[6px] text-[15px] font-medium">
                      <span className="text-[16px]">
                        <PiHandTap size={18} className="text-btn4" />
                      </span>
                      {isTimerVisible ? (
                        <span>Cooldown active</span>
                      ) : (
                        <span className="text-nowrap">{energy} taps left</span>
                      )}
                    </div>
                    <div className="bg-cards3 py-[15px] px-5 text-[#dddddd] font-medium w-[45%] flex justify-center space-x-1 items-center rounded-[6px] text-[15px]">
                      <span className="text-[16px]">
                        <PiTimerDuotone size={18} className="text-btn4" />
                      </span>
                      {isTimerVisible ? (
                        <span className="text-nowrap">
                          {formatTimeRemaining(timeRemaining)}
                        </span>
                      ) : (
                        <span>Ready to tap!</span>
                      )}
                    </div>
                  </div>
                  <h1 className="flex w-full justify-center items-center space-x-1 pb-2">
                    <img
                      src="/loader.webp"
                      className="w-[30px]"
                      alt="engagecoin"
                    />
                    <span className="text-[#fff] text-[32px] font-bold">
                      <span className="pl-[2px]">
                        {formatNumber(balance + refBonus)}{" "}
                        <span className="text-btn4">SHAKA</span>
                      </span>
                    </span>
                  </h1>
                  <div></div>

                  <div className="w-full flex justify-center items-center py-6 clickContainer">
                    <div className={`${tapGuru ? "block" : "hidden"} pyro`}>
                      <div className="before"></div>
                      <div className="after"></div>
                      <div className="w-[6px] absolute bottom-[-24px] h-[6px] bg-white rounded-full animate-pulse"></div>
                    </div>
                    <div className="w-[350px] relative flex items-center justify-center">
                      <img
                        src="/lihgt.webp"
                        alt="err"
                        className={`absolute w-[276px] rotate-45 ${
                          tapGuru ? "block" : "hidden"
                        }`}
                      />

                      {mainTap && (
                        <Container>
                          <img
                            onPointerDown={handleClick}
                            ref={imageRef}
                            src="/maxitap.webp"
                            alt="Wobble"
                            className={`wobble-image select-none`}
                          />
                          {clicks.map((click) => (
                            <SlideUpText key={click.id} x={click.x} y={click.y}>
                              +{tapValue.value}
                            </SlideUpText>
                          ))}
                          <span
                            id="tapmore"
                            className="bg-[#333333b0] hidden tapmore p-[6px] rounded-[6px] absolute top-0 right-0"
                          >
                            tap morre!
                          </span>
                          <span
                            id="tapmore2"
                            className="bg-[#333333b0] hidden tapmore p-[6px] rounded-[6px] absolute top-0 left-0"
                          >
                            wo hoo! let's go!
                          </span>
                          <span
                            id="tapmore3"
                            className="bg-[#333333b0] hidden tapmore p-[6px] rounded-[6px] absolute top-[-10px] left-[30%]"
                          >
                            tap! tap! tap!!
                          </span>
                        </Container>
                      )}

                      {tapGuru && (
                        <Container>
                          <img
                            onPointerDown={handleClickGuru}
                            ref={imageRef}
                            src="/maxitap.webp"
                            alt="Wobble"
                            className={`wobble-image select-none`}
                          />
                          {clicks.map((click) => (
                            <SlideUpText key={click.id} x={click.x} y={click.y}>
                              +{tapValue.value * tappingGuru}
                            </SlideUpText>
                          ))}
                          <span
                            id="tapmore"
                            className="bg-[#333333b0] hidden tapmore p-[6px] rounded-[6px] absolute top-0 right-0"
                          >
                            tap morre!
                          </span>
                          <span
                            id="tapmore2"
                            className="bg-[#333333b0] hidden tapmore p-[6px] rounded-[6px] absolute top-0 left-0"
                          >
                            wo hoo! let's go!
                          </span>
                          <span
                            id="tapmore3"
                            className="bg-[#333333b0] hidden tapmore p-[6px] rounded-[6px] absolute top-[-10px] left-[30%]"
                          >
                            tap! tap! tap!!
                          </span>
                        </Container>
                      )}
                    </div>
                  </div>

                  <div className="w-full flex justify-center">
                    <div
                      className={`${
                        glowBooster === true ? "glowbutton" : ""
                      } w-full flex justify-between items-center bg-cards3 rounded-[15px] py-3 px-4`}
                    >
                      {energy === 0 && points === 0 ? (
                        <>
                          <p className="text-[#dedede] py-2 text-[14px] moreTaps font-medium pr-3">
                            Need more taps? Get boosters now!
                          </p>
                          <Link
                            to="/tasks"
                            className="bg-btn4 getBoosters text-[#000] py-[14px] px-5 text-nowrap rounded-[12px] font-bold text-[15px]"
                          >
                            Get Boosters
                          </Link>
                        </>
                      ) : (
                        <>
                          <span className="text-[#fff] font-semibold text-[24px]">
                            <span className="pl-[2px]">
                              {points} <span className="text-btn4">SHAKA</span>
                            </span>
                          </span>
                          <button
                            onClick={handleClaim}
                            disabled={points === 0}
                            className={`${
                              points === 0 || openClaim
                                ? "text-[#ffffff71] bg-btn2"
                                : "bg-btn4 text-[#000]"
                            } py-[14px] px-8 rounded-[12px] font-bold text-[16px]`}
                          >
                            Claim
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Claim Modal */}
              <div className="w-full absolute top-[50px] flex justify-center z-50 pointer-events-none select-none">
                {congrats ? (
                  <img src="/congrats.gif" alt="congrats" className="w-[80%]" />
                ) : (
                  <></>
                )}
              </div>

              <div
                className={`${
                  openClaim === true ? "visible" : "invisible"
                } fixed top-[-12px] claimdiv bottom-0 left-0 z-40 right-0 h-[100vh] bg-[#00000042] flex flex-col justify-center items-center px-4`}
              >
                <div
                  className={`${
                    openClaim === true
                      ? "opacity-100 mt-0"
                      : "opacity-0 mt-[100px]"
                  } w-full bg-modal rounded-[16px] relative flex flex-col ease-in duration-300 transition-all justify-center p-8`}
                >
                  <div className="w-full flex justify-center flex-col items-center space-y-3">
                    <div className="w-full items-center justify-center flex flex-col space-y-2">
                      <IoCheckmarkCircleSharp
                        size={32}
                        className="text-accent"
                      />
                      <p className="font-medium">Let's go!!</p>
                    </div>
                    <h3 className="font-medium text-[24px] text-[#ffffff] pt-2">
                      <span className="text-accent">
                        +{bonusInfo?.basePoints}
                      </span>{" "}
                      SHAKA
                      {bonusInfo?.bonusPoints > 0 && (
                        <span className="text-[18px] text-btn4">
                          {" "}
                          (+{bonusInfo.bonusPoints} bonus)
                        </span>
                      )}
                    </h3>
                    <p className="pb-2 text-[#bfbfbf] text-[15px] w-full text-center">
                      {bonusInfo?.hasStaking
                        ? `You earned extra SHAKA from your staked NFTs! 🎉`
                        : "Want to earn more? Stake your NFTs to get bonus SHAKA! 🚀"}
                    </p>
                    <p className="pb-6 text-[#bfbfbf] text-[15px] w-full text-center">
                      {bonusInfo?.hasStaking
                        ? "Stake more NFTs to earn even bigger rewards!"
                        : "Start staking now and multiply your earnings!"}
                    </p>

                    <div className="w-full flex justify-center">
                      <button
                        onClick={closeClaimer}
                        className="bg-btn4 w-fit py-[10px] px-6 flex items-center justify-center text-center rounded-[12px] font-medium text-[16px]"
                      >
                        Tap More!
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {selectedExchange.id === "selectex" || exchangePoints < 50 ? (
                <></>
              ) : (
                <div
                  className={`${
                    claimExchangePoint ? "flex" : "hidden"
                  } fixed bottom-0 left-0 z-40 right-0 h-[100vh] bg-[#303030c4] flex-col justify-end items-center`}
                >
                  <div
                    ref={exchangeRef}
                    className={`w-full bg-divider shadowtop rounded-tl-[40px] rounded-tr-[40px] relative flex flex-col ease-in duration-300 transition-all justify-center`}
                  >
                    <div className="w-full flex bg-[#202020] rounded-tl-[40px] rounded-tr-[40px] mt-[2px] justify-center relative flex-col items-center space-y-3 p-4 pt-20 pb-10">
                      <button
                        onClick={claimExchange}
                        className="flex items-center justify-center h-[32px] w-[32px] rounded-full bg-[#383838] absolute right-6 top-4 text-center font-medium text-[16px]"
                      >
                        <IoClose size={20} className="text-[#9995a4]" />
                      </button>

                      <div className="w-full bg-cards rounded-[16px] relative px-4 flex flex-col justify-center items-center">
                        <div className="w-[68px] h-[68px] -mt-[34px] rounded-full border-[2px] border-[#1F1F1F] bg-[#3b3b3b] items-center justify-center flex flex-col space-y-2">
                          <img
                            src={selectedExchange.icon}
                            alt={selectedExchange.name}
                            className="w-[32px]"
                          />
                        </div>
                        <div className="w-full items-center flex pt-1 justify-center space-x-[6px]">
                          <img
                            src="/coin.webp"
                            alt="coin"
                            className="w-[36px]"
                          />
                          <h3 className="font-bold text-[36px] text-[#ffffff] pt-2 pb-3 mt-[4px]">
                            <span className="text-accent">
                              {formatNumber(exchangePoints.toFixed(0))}
                            </span>
                          </h3>
                        </div>

                        <p className="pb-6 text-[#bfbfbf] font-semibold px-8 text-[17px] w-full text-center">
                          The exchange has started working for you
                        </p>
                      </div>
                      <div className="w-full flex justify-center pb-7">
                        <button
                          onClick={claimExchange}
                          className="bg-btn4 w-full py-[18px] px-6 text-nowrap flex items-center justify-center text-center rounded-[12px] font-semibold text-[17px]"
                        >
                          Thank you, {selectedExchange.name}{" "}
                          <FaHeart size={17} className="mt-[2px] pl-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Character Selection Modal */}
              <div
                className={`${
                  characterSelect ? "visible" : "invisible"
                } fixed bottom-0 left-0 z-40 right-0 h-[100vh] bg-[#00000042] flex justify-center items-end backdrop-blur-[10px]`}
              >
                <div className="w-full bg-[#202020] rounded-tl-[40px] rounded-tr-[40px] p-6">
                  <h2 className="text-xl font-bold mb-4">
                    Choose Your Character
                  </h2>
                  <div className="flex justify-center space-x-4">
                    {characters.map((character) => (
                      <div
                        key={character.name}
                        onClick={() => handleCharacterSelect(character)}
                        className="w-[110px] h-[110px] cursor-pointer hover:scale-105 transition-transform"
                      >
                        <img
                          src={character.avatar}
                          alt={character.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Full Name Input Modal */}
              <div
                className={`${
                  fullNameSelect ? "visible" : "invisible"
                } fixed bottom-0 left-0 z-40 right-0 h-[100vh] bg-[#00000042] flex justify-center items-end backdrop-blur-[10px]`}
              >
                <div className="w-full bg-[#202020] rounded-tl-[40px] rounded-tr-[40px] p-6">
                  <h2 className="text-xl font-bold mb-4">Enter Your Name</h2>
                  {error && <p className="text-red-500 mb-2">{error}</p>}
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full p-3 rounded-lg bg-[#303030] mb-4"
                  />
                  <button
                    onClick={handleSaveFullName}
                    className="w-full bg-btn4 text-black font-bold py-3 rounded-lg"
                  >
                    Continue to Game
                  </button>
                </div>
              </div>
            </div>
            <Levels showLevel={showLevel} setShowLevel={setShowLevel} />
            <Exchanges
              showExchange={showExchange}
              setShowExchange={setShowExchange}
            />
            <SettingsMenu
              showSetting={showSetting}
              setShowSetting={setShowSetting}
            />
          </div>
        </Animate>
      )}
    </>
  );
};

export default GoldHunters;
