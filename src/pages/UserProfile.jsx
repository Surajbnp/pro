import React, { useState, useRef, useEffect } from "react";
import { useUser } from "../context/userContext";
import { motion, AnimatePresence } from "framer-motion";
import formatNumber from "../utils/formatNumber";
import { uploadFile } from "../utils/fileUpload";
import { toast } from "react-hot-toast";
import Spinner from "../components/Spinner";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const UserProfile = () => {
  const {
    balance,
    energy,
    tapBalance,
    level,
    selectedCharacter,
    fullName,
    selectedExchange,
    claimedMilestones,
    updateProfile,
    changePassword,
  } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(fullName);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [passwordSection, setPasswordSection] = useState({
    isEditing: false,
    newPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Simulate loading time for initial data fetch
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const uploadResult = await uploadFile(file, "avatars");
      const updatedCharacter = {
        ...selectedCharacter,
        avatar: uploadResult.url,
      };

      await updateProfile({
        fullName: newName,
        character: updatedCharacter,
      });

      toast.success("Profile picture updated successfully!");
    } catch (error) {
      setImagePreview(null); // Reset preview on error
      toast.error("Failed to update profile picture");
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNameSubmit = async () => {
    if (newName.trim() === "") {
      toast.error("Name cannot be empty");
      return;
    }

    setIsUploading(true);
    try {
      await updateProfile({
        fullName: newName,
        character: selectedCharacter,
      });
      setIsEditing(false);
      toast.success("Name updated successfully!");
    } catch (error) {
      toast.error("Failed to update name");
      console.error("Error updating name:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validate new password
    if (passwordSection.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    const success = await changePassword(passwordSection.newPassword);

    if (success) {
      setPasswordSection({
        isEditing: false,
        newPassword: "",
      });
      setShowPassword(false);
      navigate("/");
      toast.success("Password changed. Please log back in.", {
        duration: 4000,
      });
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24 font-Cerebri ">
      {/* Header Section with Avatar and Basic Info */}
      <motion.div
        className="flex items-center mb-8 p-6 rounded-2xl bg-cards3 border border-borders2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <motion.div className="relative" whileHover={{ scale: 1.05 }}>
            <img
              src={imagePreview || selectedCharacter?.avatar || "/boy.webp"}
              alt="Profile Avatar"
              className={`w-24 h-24 rounded-full mr-6 border-2 border-accent cursor-pointer ${
                isUploading ? "opacity-50" : ""
              }`}
              onClick={handleImageClick}
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </motion.div>
          <div className="absolute bottom-0 right-6 bg-accent rounded-full p-1 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-primary"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
        <div>
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-xl bg-modal border border-borders2 rounded px-2 py-1 text-primary"
                placeholder="Enter your name"
                disabled={isUploading}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleNameSubmit}
                  disabled={isUploading}
                  className={`text-sm px-3 py-1 bg-accent text-primary rounded hover:bg-opacity-80 transition-colors ${
                    isUploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isUploading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewName(fullName);
                  }}
                  disabled={isUploading}
                  className="text-sm px-3 py-1 bg-modal text-secondary rounded hover:bg-opacity-80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-primary mb-1">
                {fullName}
              </h1>
              <button
                onClick={() => setIsEditing(true)}
                disabled={isUploading}
                className="text-accent hover:text-accent2 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          )}
          <div className="flex items-center">
            <img src={level?.imgUrl} alt="Level" className="w-5 h-5 mr-2" />
            <span className="text-accent">{level?.name} Level</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { title: "Balance", value: formatNumber(balance), icon: "💰" },
          { title: "Energy", value: energy, icon: "⚡" },
          {
            title: "SHAKA Balance",
            value: formatNumber(tapBalance),
            icon: "💲",
          },
          {
            title: "Level Progress",
            value: `${Math.round(level?.currentProgress || 0)}%`,
            icon: "📈",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            className="p-5 bg-cards3 rounded-xl border border-borders2 hover:bg-modal transition-colors duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center mb-2">
              <span className="mr-2 text-xl">{stat.icon}</span>
              <h2 className="font-semibold text-secondary">{stat.title}</h2>
            </div>
            <p className="text-xl text-primary">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Level Progress */}
      <motion.div
        className="mb-8 p-6 bg-cards3 rounded-xl border border-borders2"
        {...fadeInUp}
      >
        <h2 className="font-semibold text-secondary mb-4">Level Progress</h2>
        <div className="flex items-center mb-3">
          <img
            src={level?.imgUrl}
            alt="Current Level"
            className="w-12 h-12 mr-4"
          />
          <div className="flex-1">
            <div className="h-2 bg-energybar rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${level?.currentProgress || 0}%` }}
              />
            </div>
          </div>
          {level?.nextLevel && (
            <img
              src={level.nextLevel.imgUrl}
              alt="Next Level"
              className="w-12 h-12 ml-4 opacity-50"
            />
          )}
        </div>
        {level?.nextLevel && (
          <p className="text-sm text-dimtext text-center">
            {formatNumber(level.nextLevel.remainingBalance)} SHAKA needed for{" "}
            {level.nextLevel.name}
          </p>
        )}
      </motion.div>

      {/* Milestones */}
      {claimedMilestones?.length > 0 && (
        <motion.div
          className="mb-8 p-6 bg-cards3 rounded-xl border border-borders2"
          {...fadeInUp}
        >
          <h2 className="font-semibold text-secondary mb-4">Achievements</h2>
          <div className="flex flex-wrap gap-2">
            {claimedMilestones?.map((milestone, index) => (
              <motion.span
                key={index}
                className="px-4 py-2 bg-modal text-accent rounded-full text-sm border border-borders2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {milestone}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Selected Exchange */}
      {selectedExchange?.id !== "selectex" && (
        <motion.div
          className="p-6 bg-cards3 rounded-xl border border-borders2"
          {...fadeInUp}
        >
          <h2 className="font-semibold text-secondary mb-4">
            Connected Exchange
          </h2>
          <div className="flex items-center">
            <img
              src={selectedExchange?.icon}
              alt="Exchange Icon"
              className="w-8 h-8 mr-3"
            />
            <p className="text-primary">{selectedExchange?.name}</p>
          </div>
        </motion.div>
      )}

      {/* Password Change */}
      <motion.div
        className="mb-8 p-6 bg-cards3 rounded-xl border border-borders2"
        {...fadeInUp}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-secondary">Change Password</h2>
          {!passwordSection.isEditing && (
            <button
              onClick={() =>
                setPasswordSection((prev) => ({ ...prev, isEditing: true }))
              }
              className="text-accent hover:text-accent2 transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {passwordSection.isEditing && (
          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={passwordSection.newPassword}
                onChange={(e) =>
                  setPasswordSection((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 pr-10 bg-modal border border-borders2 rounded text-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-accent text-primary rounded hover:bg-opacity-80"
              >
                Save Password
              </button>
              <button
                onClick={() =>
                  setPasswordSection((prev) => ({
                    ...prev,
                    isEditing: false,
                    newPassword: "",
                  }))
                }
                className="px-4 py-2 bg-modal text-secondary rounded hover:bg-opacity-80"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UserProfile;
