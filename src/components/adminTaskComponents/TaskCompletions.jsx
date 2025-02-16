import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase/firestore";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  runTransaction,
} from "firebase/firestore";
import { useAdmin } from "../../contexts/AdminContext";
import { toast } from "react-hot-toast";
import {
  PiCalendarCheckBold,
  PiClockCountdownBold,
  PiLinkBold,
  PiFileBold,
  PiCoinsBold,
  PiCheckCircleBold,
  PiXCircleBold,
} from "react-icons/pi";
import Spinner from "../Spinner";

const TaskCompletions = () => {
  const { taskId } = useParams();
  const { admin } = useAdmin();
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmails, setUserEmails] = useState({});
  const [processingIds, setProcessingIds] = useState([]);
  const [rejectRemark, setRejectRemark] = useState({});
  const [showRejectInput, setShowRejectInput] = useState({});

  const classifyUserId = (id) => {
    // Firebase IDs typically contain letters, numbers, hyphens
    const isFirebaseId = /^[a-zA-Z0-9._-]+$/.test(id);

    // Telegram IDs are numeric only and usually large numbers
    const isTelegramId = /^\d+$/.test(id);

    if (isTelegramId) {
      return {
        type: "telegram",
        collection: "telegramUsers",
      };
    } else if (isFirebaseId) {
      return {
        type: "firebase",
        collection: "users",
      };
    } else {
      return {
        type: "unknown",
        collection: "unknown",
      };
    }
  };

  useEffect(() => {
    fetchCompletions();
  }, [taskId]);

  const fetchUserEmail = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return userDoc.data().email;
      }
      return "Email not found";
    } catch (error) {
      console.error("Error fetching user email:", error);
      return "Error loading email";
    }
  };

  const fetchCompletions = async () => {
    try {
      const q = query(
        collection(db, "taskAttempts"),
        where("taskId", "==", taskId)
      );

      const querySnapshot = await getDocs(q);
      const completionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch emails for all users
      const emailPromises = completionsData.map(async (completion) => {
        const email = await fetchUserEmail(completion.userId);
        setUserEmails((prev) => ({ ...prev, [completion.userId]: email }));
      });

      await Promise.all(emailPromises);
      setCompletions(completionsData);
    } catch (error) {
      console.error("Error fetching completions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "approved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const fetchUserDetails = async (userId) => {
    const userType = classifyUserId(userId);

    try {
      const userDoc = await getDoc(doc(db, userType.collection, userId));
      if (userDoc.exists()) {
        return {
          type: userType.type,
          data: userDoc.data(),
          exists: true,
        };
      }
      return {
        type: userType.type,
        exists: false,
        data: null,
      };
    } catch (error) {
      console.error(`Error fetching ${userType.type} user:`, error);
      return {
        type: userType.type,
        exists: false,
        error: error.message,
      };
    }
  };

  const updateUserBalance = async (userId, amount) => {
    const userType = classifyUserId(userId);
    const userRef = doc(db, userType.collection, userId);

    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) {
          throw new Error(`${userType.type} user not found`);
        }

        // Get current balance or default to 0
        const currentBalance = userDoc.data().balance || 0;
        const newBalance = currentBalance + amount;

        // Update the balance
        transaction.update(userRef, {
          balance: newBalance,
          updatedAt: new Date().toISOString(),
        });
      });

      return true;
    } catch (error) {
      console.error("Error updating user balance:", error);
      throw error;
    }
  };

  const handleRejectClick = (completionId) => {
    setShowRejectInput((prev) => ({
      ...prev,
      [completionId]: true,
    }));
  };

  const handleReviewSubmission = async (
    completionId,
    isApproved,
    remarks = ""
  ) => {
    if (processingIds.includes(completionId)) return;

    setProcessingIds((prev) => [...prev, completionId]);

    try {
      const completion = completions.find((c) => c.id === completionId);
      if (!completion) throw new Error("Completion not found");

      const currentDate = new Date().toISOString();
      const submissionRef = doc(db, "taskAttempts", completionId);

      if (isApproved) {
        // First verify user exists and get their details
        const userDetails = await fetchUserDetails(completion.userId);

        if (!userDetails.exists) {
          toast.error(`User not found in ${userDetails.type} database`);
          return;
        }

        try {
          // Update user balance first
          await updateUserBalance(completion.userId, completion.taskBonus);

          // Then update the task attempt
          await updateDoc(submissionRef, {
            reviewStatus: "approved",
            reviewedAt: currentDate,
            reviewedBy: admin.uid,
            status: "approved",
            completedAt: currentDate,
            remarks: remarks,
          });

          toast.success("Task approved and balance updated successfully!");
        } catch (error) {
          console.error("Transaction failed:", error);
          toast.error("Failed to update user balance");
          return;
        }
      } else {
        // Update rejection with remarks
        await updateDoc(submissionRef, {
          reviewStatus: "rejected",
          reviewedAt: currentDate,
          reviewedBy: admin.uid,
          status: "rejected",
          remarks: remarks,
        });

        toast.success("Task submission rejected");
      }

      // Update local state
      setCompletions((prev) =>
        prev.map((c) =>
          c.id === completionId
            ? {
                ...c,
                status: isApproved ? "approved" : "rejected",
                reviewStatus: isApproved ? "approved" : "rejected",
                reviewedAt: currentDate,
                reviewedBy: admin.uid,
                remarks: remarks,
                ...(isApproved && { completedAt: currentDate }),
              }
            : c
        )
      );
    } catch (error) {
      console.error("Error processing submission:", error);
      toast.error(error.message || "Failed to process submission");
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== completionId));
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Task Submissions</h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-sm">
            {completions.filter((c) => c.status === "pending").length} Pending
          </span>
          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm">
            {completions.filter((c) => c.status === "approved").length} Approved
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {completions.map((completion) => (
          <div
            key={completion.id}
            className="bg-cards p-6 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <h3 className="font-medium text-white">
                  Submitted By : {userEmails[completion.userId] || "Loading..."}
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(
                  completion.status
                )}`}
              >
                {completion.status}
              </span>
            </div>

            {/* Timeline */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <PiClockCountdownBold className="w-4 h-4" />
                Started: {new Date(completion.startedAt).toLocaleString()}
              </div>
              {completion.completedAt && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <PiCalendarCheckBold className="w-4 h-4" />
                  Completed: {new Date(completion.completedAt).toLocaleString()}
                </div>
              )}
            </div>

            {/* Proof Section */}
            {completion.proof && (
              <div className="mb-4 p-3  space-y-2">
                <h4 className="text-sm font-medium text-gray-300">
                  Proof Uploaded
                </h4>
                <div className="flex items-center gap-5">
                  {completion.proof.link && (
                    <a
                      href={completion.proof.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#FBC535] hover:text-[#FBC535]/80 flex items-center gap-2 bg-gray-700/30 px-3 py-1 rounded-lg"
                    >
                      <PiLinkBold className="w-4 h-4" />
                      View Link
                    </a>
                  )}
                  {completion.proof.file && (
                    <a
                      href={completion.proof.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#FBC535] hover:text-[#FBC535]/80 flex items-center gap-2 bg-gray-700/30 px-3 py-1 rounded-lg"
                    >
                      <PiFileBold className="w-4 h-4" />
                      View File
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {completion.status === "submitted" && (
              <div className="flex flex-col gap-3">
                {showRejectInput[completion.id] ? (
                  // Show reject input form
                  <div className="flex flex-col gap-3">
                    <textarea
                      value={rejectRemark[completion.id] || ""}
                      onChange={(e) =>
                        setRejectRemark((prev) => ({
                          ...prev,
                          [completion.id]: e.target.value,
                        }))
                      }
                      placeholder="Enter reason for rejection..."
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-[#FBC535] min-h-[100px]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowRejectInput((prev) => ({
                            ...prev,
                            [completion.id]: false,
                          }));
                          setRejectRemark((prev) => ({
                            ...prev,
                            [completion.id]: "",
                          }));
                        }}
                        className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          handleReviewSubmission(
                            completion.id,
                            false,
                            rejectRemark[completion.id]
                          )
                        }
                        disabled={
                          !rejectRemark[completion.id]?.trim() ||
                          processingIds.includes(completion.id)
                        }
                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50"
                      >
                        {processingIds.includes(completion.id)
                          ? "Processing..."
                          : "Confirm Reject"}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Show normal action buttons
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleReviewSubmission(completion.id, true)
                      }
                      disabled={processingIds.includes(completion.id)}
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PiCheckCircleBold className="w-4 h-4" />
                      {processingIds.includes(completion.id)
                        ? "Processing..."
                        : "Approve"}
                    </button>
                    <button
                      onClick={() => handleRejectClick(completion.id)}
                      disabled={processingIds.includes(completion.id)}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PiXCircleBold className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Bonus */}
            <div className="mt-4 pt-4 border-t border-gray-700/30">
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <PiCoinsBold className="w-4 h-4 text-[#FBC535]" />
                Bonus: {completion.taskBonus}
              </p>
            </div>
          </div>
        ))}

        {completions.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-400">No submissions found for this task.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCompletions;
