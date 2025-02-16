import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useUser } from "../context/userContext";
import { toast } from "react-hot-toast";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";
import ClaimSuccess from "./ClaimSuccess";
import { uploadFile } from "../utils/fileUpload";

const TasksContent = ({ task, attemptStatus, onTaskClaimed, taskType }) => {
  const { id: userId } = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClaimLoading, setIsClaimLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const formattedDate = format(new Date(task?.createdAt), "MMM dd, yyyy");
  const [proofUrl, setProofUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [taskAttempt, setTaskAttempt] = useState(null);
  const [hasVisitedLink, setHasVisitedLink] = useState(false);

  // Description truncation logic
  const MAX_LENGTH = 100;
  const isLongDescription = task?.description?.length > MAX_LENGTH;
  const displayDescription = isExpanded
    ? task?.description
    : task?.description?.slice(0, MAX_LENGTH) + "...";

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmitProof = async () => {
    if (!proofUrl && !selectedFile) {
      toast.error("Please provide either a URL or upload a file as proof");
      return;
    }

    setIsSubmitting(true);
    try {
      let fileData = null;

      if (selectedFile) {
        fileData = await uploadFile(selectedFile, `${taskType}-proofs`);
      }

      const attemptsCollectionRef = collection(db, "taskAttempts");
      const attemptQuery = query(
        attemptsCollectionRef,
        where("userId", "==", userId),
        where("taskId", "==", task.id),
        where("taskType", "==", taskType)
      );
      const attemptDocs = await getDocs(attemptQuery);

      if (!attemptDocs.empty) {
        const attemptDoc = attemptDocs.docs[0];
        await setDoc(
          doc(db, "taskAttempts", attemptDoc.id),
          {
            ...attemptDoc.data(),
            proof: {
              file: fileData?.url || null,
              link: proofUrl || null,
              submittedAt: new Date().toISOString(),
            },
            status: "submitted",
          },
          { merge: true }
        );

        toast.success("Proof submitted successfully!");
        onTaskClaimed(); // Refresh the task list
      }
    } catch (error) {
      console.error("Error submitting proof:", error);
      toast.error("Failed to submit proof. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaim = async () => {
    setIsClaimLoading(true);
    try {
      const attemptsCollectionRef = collection(db, "taskAttempts");
      const newAttemptRef = doc(attemptsCollectionRef);

      await setDoc(newAttemptRef, {
        userId,
        taskId: task.id,
        status: "pending",
        startedAt: new Date().toISOString(),
        taskBonus: task.bonus,
        completedAt: null,
        proof: null,
        reviewStatus: null,
        reviewedAt: null,
        reviewedBy: null,
        taskType,
      });

      setShowSuccess(true);
      onTaskClaimed(); // Refresh the parent component's data
    } catch (error) {
      console.error("Error claiming task:", error);
      toast.error("Failed to claim task. Please try again.");
    } finally {
      setIsClaimLoading(false);
    }
  };

  const fetchTaskAttempt = async () => {
    try {
      const attemptsCollectionRef = collection(db, "taskAttempts");
      const attemptQuery = query(
        attemptsCollectionRef,
        where("userId", "==", userId),
        where("taskId", "==", task.id),
        where("taskType", "==", taskType)
      );
      const attemptDocs = await getDocs(attemptQuery);

      if (!attemptDocs.empty) {
        const attemptData = attemptDocs.docs[0].data();
        setTaskAttempt(attemptData);
      }
    } catch (error) {
      console.error("Error fetching task attempt:", error);
    }
  };

  useEffect(() => {
    if (attemptStatus === "rejected") {
      fetchTaskAttempt();
    }
  }, [attemptStatus]);

  // Add this function to handle link clicks
  const handleLinkClick = () => {
    setHasVisitedLink(true);
  };

  // Modify the link rendering in the JSX
  const renderTaskLink = () => {
    if (task?.link) {
      return (
        <a
          href={task.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkClick}
          className="inline-block text-sm text-[#FBC535] hover:text-[#FBC535]/80 underline transition-colors duration-200"
        >
          Task Link →
        </a>
      );
    }
    return null;
  };

  // Render claim button based on status
  const renderActionButton = () => {
    // For rejected tasks
    if (attemptStatus === "rejected") {
      return (
        <div className="flex flex-col gap-3 w-full">
          <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">
            <span className="font-medium ">Rejection Reason: </span>
            <span className="text-sm text-gray-400 capitalize mx-3">
              {taskAttempt?.remarks || "No reason provided"}
            </span>
          </div>

          <div className="mt-2">
            <p className="text-sm text-gray-400 mb-2">Resubmit your proof:</p>
            <input
              type="text"
              placeholder="Enter proof URL (optional)"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[#FBC535]"
            />
            <div className="flex flex-col gap-2 mt-2">
              <input
                type="file"
                onChange={handleFileChange}
                className="text-sm text-gray-400"
                accept="image/*,.pdf,.doc,.docx"
              />
              <button
                onClick={handleSubmitProof}
                disabled={isSubmitting}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all duration-300 
                  ${
                    isSubmitting
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-[#FBC535] text-black hover:bg-opacity-90"
                  }
                `}
              >
                {isSubmitting ? "Submitting..." : "Resubmit Proof"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // For submitted tasks
    if (attemptStatus === "submitted") {
      return (
        <button
          className="px-4 py-2 rounded-lg font-medium bg-blue-500/60 text-white cursor-not-allowed"
          disabled
        >
          Proof Submitted
        </button>
      );
    }

    // For completed/approved tasks
    if (attemptStatus === "approved") {
      return (
        <button
          className="px-4 py-2 rounded-lg font-medium bg-green-500 text-white cursor-not-allowed"
          disabled
        >
          Task Completed
        </button>
      );
    }

    // For pending tasks - show proof submission form
    if (attemptStatus === "pending") {
      return (
        <div className="flex flex-col gap-3 w-full">
          <input
            type="text"
            placeholder="Enter proof URL (optional)"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[#FBC535]"
          />
          <div className="flex flex-col gap-2">
            <input
              type="file"
              onChange={handleFileChange}
              className="text-sm text-gray-400"
              accept="image/*,.pdf,.doc,.docx"
            />
            <button
              onClick={handleSubmitProof}
              disabled={isSubmitting}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-300 
                ${
                  isSubmitting
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-[#FBC535] text-black hover:bg-opacity-90"
                }
              `}
            >
              {isSubmitting ? "Submitting..." : "Submit Proof"}
            </button>
          </div>
        </div>
      );
    }

    // For unclaimed tasks - show claim button
    return (
      <button
        onClick={handleClaim}
        disabled={isClaimLoading || !hasVisitedLink}
        className={`
          px-4 py-2 rounded-lg font-medium transition-all duration-300 
          ${
            isClaimLoading || !hasVisitedLink
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-[#FBC535] text-black hover:bg-opacity-90 hover:-translate-y-0.5 transform"
          }
        `}
        title={!hasVisitedLink ? "Please visit the task link first" : ""}
      >
        {isClaimLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Claiming...
          </span>
        ) : !hasVisitedLink ? (
          "Visit Link First"
        ) : (
          `Claim ${task?.bonus} Points`
        )}
      </button>
    );
  };

  return (
    <>
      <div className="w-full bg-black rounded-lg p-4 hover:shadow-[0_0_10px_rgba(251,197,53,0.3)] transition-all duration-300">
        <div className="flex flex-col gap-4">
          {/* Main content container - make it responsive */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left side with image and content - stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg mx-auto sm:mx-0">
                <img
                  src={task?.icon}
                  alt={task?.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>

              {/* Middle content */}
              <div className="flex-1">
                <div className="flex flex-col">
                  <h3 className="text-[#FBC535] text-lg font-semibold mb-1 text-center sm:text-left">
                    {task?.title}
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm text-center sm:text-left">
                      {displayDescription}
                      {isLongDescription && (
                        <button
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="text-[#FBC535] hover:text-[#FBC535]/80 ml-2 text-sm font-medium transition-colors duration-200"
                        >
                          {isExpanded ? "Show Less" : "Read More"}
                        </button>
                      )}
                    </p>
                    <div className="text-center sm:text-left">
                      {renderTaskLink()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side content - stack on mobile */}
            <div className="flex flex-col items-center sm:items-end gap-2">
              <span className="text-gray-400 text-xs">{formattedDate}</span>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                {renderActionButton()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ClaimSuccess
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
};

export default TasksContent;
