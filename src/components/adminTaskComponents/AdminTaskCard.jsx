import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";

const AdminTaskCard = ({ task, onEdit, onDelete, isDeleting }) => {
  const navigate = useNavigate();
  const formattedDate = format(new Date(task?.createdAt), "MMM dd, yyyy");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });
  const [pendingCount, setPendingCount] = useState(0);

  // Description truncation logic
  const MAX_LENGTH = 50;
  const isLongDescription = task?.description?.length > MAX_LENGTH;
  const displayDescription =
    !isEditing && !isExpanded
      ? task?.description?.slice(0, MAX_LENGTH) + "..."
      : task?.description;

  const handleSave = () => {
    // Validate required fields
    if (!editedTask.title || !editedTask.description || !editedTask.bonus) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Ensure bonus is a number
    const updatedTask = {
      ...editedTask,
      bonus: Number(editedTask.bonus),
    };

    onEdit(updatedTask);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask({ ...task }); // Reset to original task data
    setIsEditing(false);
  };

  const handleCompletionsClick = () => {
    navigate(`/dashboardAdx/task-completions/${task.id}`);
  };

  // When task prop changes, update editedTask
  useEffect(() => {
    setEditedTask({ ...task });
  }, [task]);

  const fetchPendingCount = async () => {
    try {
      const q = query(
        collection(db, "taskAttempts"),
        where("taskId", "==", task.id),
        where("status", "==", "submitted")
      );

      const querySnapshot = await getDocs(q);
      setPendingCount(querySnapshot.size);
    } catch (error) {
      console.error("Error fetching pending count:", error);
    }
  };

  useEffect(() => {
    fetchPendingCount();
  }, [task.id]);

  return (
    <div className="p-4 md:p-6 rounded-xl bg-cards shadow-lg hover:shadow-xl transition-all duration-300 w-full flex flex-col space-y-4 overflow-hidden border border-gray-700/30">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Icon Container */}
        <div className="flex-shrink-0 bg-gray-800/30 rounded-lg p-3">
          <img
            src={task.icon || "/telegram.svg"}
            alt={task.title}
            className="w-[30px] h-[30px] object-contain"
          />
        </div>

        {/* Content Container */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            {isEditing ? (
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, title: e.target.value })
                }
                className="text-lg md:text-xl font-semibold bg-gray-800/50 rounded px-2 py-1 border border-gray-700 focus:border-[#FBC535] outline-none"
              />
            ) : (
              <h3 className="text-lg md:text-xl font-semibold text-white">
                {task.title}
              </h3>
            )}
            {isEditing ? (
              <input
                type="number"
                value={editedTask.bonus}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, bonus: e.target.value })
                }
                className="w-24 px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700 focus:border-[#FBC535] outline-none text-[#FBC535]"
              />
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FBC535]/10 text-[#FBC535]">
                Bonus: {task.bonus}
              </span>
            )}
          </div>

          {isEditing ? (
            <textarea
              value={editedTask.description}
              onChange={(e) =>
                setEditedTask({ ...editedTask, description: e.target.value })
              }
              rows="3"
              className="w-full text-sm md:text-base bg-gray-800/50 rounded px-2 py-1 border border-gray-700 focus:border-[#FBC535] outline-none resize-none"
            />
          ) : (
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              {displayDescription}
              {isLongDescription && !isEditing && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[#FBC535] hover:text-[#FBC535]/80 ml-2 font-medium transition-colors duration-200"
                >
                  {isExpanded ? "Show Less" : "Read More"}
                </button>
              )}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{formattedDate}</span>
            </div>
            <button
              onClick={handleCompletionsClick}
              className="flex items-center gap-2 hover:text-[#FBC535] transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span>{pendingCount || 0} New Submissions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Actions Container */}
      <div className="flex items-center justify-start gap-3 pt-2 border-t border-gray-700/30">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>
            <button
              onClick={() => onDelete(task.id)}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminTaskCard;
