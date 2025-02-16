import React from "react";
import { PiNotebook } from "react-icons/pi";
import { MdPendingActions } from "react-icons/md";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { MdErrorOutline } from "react-icons/md";
import { FaTelegram } from "react-icons/fa";
import { FaShare } from "react-icons/fa";

const TaskTabs = ({
  activeTaskTab,
  setActiveTaskTab,
  taskType,
  setTaskType,
  taskCounts,
}) => {
  // Helper function to render count badge
  const renderCount = (count) => {
    if (count > 0) {
      return (
        <span className="ml-2 bg-[#FBC535]/20 text-[#FBC535] text-xs px-2 py-0.5 rounded-full">
          {count}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Task Type Selector */}
      <div className="w-full flex flex-wrap items-center gap-2">
        <div
          onClick={() => setTaskType("telegramTasks")}
          className={`${
            taskType === "telegramTasks"
              ? "bg-cards text-[#ebebeb] border-[#FBC535]"
              : "border-gray-700 hover:border-gray-600"
          } rounded-[6px] text-primary py-[10px] px-3 flex-1 min-w-[150px] flex space-x-2 justify-center text-center text-[15px] font-semibold items-center cursor-pointer border transition-all duration-300`}
        >
          <FaTelegram size={16} />
          <span className="hidden sm:inline">Telegram Tasks</span>
          <span className="sm:hidden">Telegram</span>
        </div>

        <div
          onClick={() => setTaskType("socialTasks")}
          className={`${
            taskType === "socialTasks"
              ? "bg-cards text-[#ebebeb] border-[#FBC535]"
              : "border-gray-700 hover:border-gray-600"
          } rounded-[6px] text-primary py-[10px] px-3 flex-1 min-w-[150px] flex space-x-2 justify-center text-center text-[15px] font-semibold items-center cursor-pointer border transition-all duration-300`}
        >
          <FaShare size={16} />
          <span className="hidden sm:inline">Social Tasks</span>
          <span className="sm:hidden">Social</span>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div
          onClick={() => setActiveTaskTab(1)}
          className={`${
            activeTaskTab === 1
              ? "bg-cards text-[#ebebeb] border-[#FBC535]"
              : "border-gray-700 hover:border-gray-600"
          } rounded-[6px] text-primary py-[10px] px-3 flex space-x-2 justify-center text-center text-[15px] font-semibold items-center cursor-pointer border transition-all duration-300`}
          title="All Tasks"
        >
          <PiNotebook size={16} />
          <span className="hidden sm:inline">All Tasks</span>
          <span className="sm:hidden">All</span>
          {renderCount(taskCounts.all)}
        </div>

        <div
          onClick={() => setActiveTaskTab(2)}
          className={`${
            activeTaskTab === 2
              ? "bg-cards text-[#ebebeb] border-[#FBC535]"
              : "border-gray-700 hover:border-gray-600"
          } rounded-[6px] text-primary py-[10px] px-3 space-x-2 font-semibold text-[15px] flex justify-center text-center items-center cursor-pointer border transition-all duration-300`}
          title="Pending Tasks"
        >
          <MdPendingActions size={16} />
          <span className="hidden sm:inline">Pending</span>
          <span className="sm:hidden">Pending</span>
          {renderCount(taskCounts.pending)}
        </div>

        <div
          onClick={() => setActiveTaskTab(3)}
          className={`${
            activeTaskTab === 3
              ? "bg-cards text-[#ebebeb] border-[#FBC535]"
              : "border-gray-700 hover:border-gray-600"
          } rounded-[6px] text-primary py-[10px] px-3 space-x-2 font-semibold text-[15px] flex justify-center text-center items-center cursor-pointer border transition-all duration-300`}
          title="Completed Tasks"
        >
          <IoCheckmarkDoneCircle size={16} />
          <span className="hidden sm:inline">Completed</span>
          <span className="sm:hidden">Done</span>
          {renderCount(taskCounts.completed)}
        </div>

        <div
          onClick={() => setActiveTaskTab(4)}
          className={`${
            activeTaskTab === 4
              ? "bg-cards text-[#ebebeb] border-[#FBC535]"
              : "border-gray-700 hover:border-gray-600"
          } rounded-[6px] text-primary py-[10px] px-3 space-x-2 font-semibold text-[15px] flex justify-center text-center items-center cursor-pointer border transition-all duration-300`}
          title="Rejected Tasks"
        >
          <MdErrorOutline size={16} />
          <span className="hidden sm:inline">Rejected</span>
          <span className="sm:hidden">Rejected</span>
          {renderCount(taskCounts.rejected)}
        </div>
      </div>
    </div>
  );
};

export default TaskTabs;
