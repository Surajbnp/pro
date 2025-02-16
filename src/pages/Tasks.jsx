import React, { useState, useEffect } from "react";
import Animate from "../components/Animate";
import { Outlet } from "react-router-dom";
import { useUser } from "../context/userContext";
import { PiNotebook } from "react-icons/pi";
import { FaBoxes } from "react-icons/fa";
import { RiArrowRightSLine } from "react-icons/ri";
import Levels from "../components/Levels";
import MilestoneRewards from "../components/MilestoneRewards";
import Boost from "./Boost";
import ErrorBoundary from "../components/ErrorBoundary";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import TasksContent from "../components/TasksContent";
import TaskTabs from "../components/TaskTabs";
import { toast } from "react-hot-toast";

const TasksList = () => {
  const {
    balance,
    level,
    refBonus,
    isLoading: contextLoading,
    id: userId,
  } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(1);
  const [activeTaskTab, setActiveTaskTab] = useState(1);
  const [showLevel, setShowLevel] = useState();
  const [tasks, setTasks] = useState([]);
  const [taskAttempts, setTaskAttempts] = useState({});
  const [taskType, setTaskType] = useState("telegramTasks"); // Default to telegram tasks

  const fetchTasksAndAttempts = async () => {
    try {
      // Determine which collection to use based on taskType
      const collectionName =
        taskType === "telegramTasks" ? "telegramTasks" : "socialTasks";

      // Fetch tasks from the appropriate collection
      const tasksCollectionRef = collection(db, collectionName);
      const tasksSnapshot = await getDocs(tasksCollectionRef);
      const tasksData = tasksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch user's task attempts for the current task type
      const attemptsQuery = query(
        collection(db, "taskAttempts"),
        where("userId", "==", userId),
        where("taskType", "==", taskType)
      );
      const attemptsSnapshot = await getDocs(attemptsQuery);

      const attemptsMap = {};
      attemptsSnapshot.forEach((doc) => {
        const attempt = doc.data();
        attemptsMap[attempt.taskId] = attempt.status;
      });

      setTaskAttempts(attemptsMap);
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    }
  };

  useEffect(() => {
    if (!contextLoading) {
      setIsLoading(false);
      fetchTasksAndAttempts();
    }
  }, [contextLoading, taskType]); // Add taskType as dependency

  const handleMenu = (index) => {
    setActiveIndex(index);
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

  // Filter tasks based on activeTaskTab and attempts
  const getFilteredTasks = () => {
    return tasks.filter((task) => {
      const attemptStatus = taskAttempts[task.id];

      switch (activeTaskTab) {
        case 1: // All available tasks
          return !attemptStatus; // Show only unclaimed tasks
        case 2: // Pending tasks
          return attemptStatus === "pending" || attemptStatus === "submitted"; // Show both pending and submitted tasks
        case 3: // Completed tasks
          return attemptStatus === "approved";
        case 4: // Rejected tasks
          return attemptStatus === "rejected";
        default:
          return true;
      }
    });
  };

  // Add this function to calculate task counts
  const getTaskCounts = () => {
    const counts = {
      all: tasks.filter((task) => !taskAttempts[task.id]).length,
      pending: tasks.filter(
        (task) =>
          taskAttempts[task.id] === "pending" ||
          taskAttempts[task.id] === "submitted"
      ).length,
      completed: tasks.filter((task) => taskAttempts[task.id] === "approved")
        .length,
      rejected: tasks.filter((task) => taskAttempts[task.id] === "rejected")
        .length,
    };
    return counts;
  };

  return (
    <ErrorBoundary>
      <Animate>
        <div className="w-full pt-1 justify-center flex-col space-y-6 px-5">
          <div className="w-full flex justify-between">
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
              <span className="font-medium text-[15px] text-secondary flex items-center space-x-1">
                <span className=""> {level.name}</span>
                <span className="flex items-center">
                  {" "}
                  <RiArrowRightSLine size={18} className="" />{" "}
                </span>
              </span>
            </button>

            <div className="w-fit py-[2px] px-3 flex items-center space-x-1 justify-center border-[1px] border-[#707070] rounded-[25px]">
              <span className="w-[14px]">
                <img alt="engy" src="/loader.webp" className="w-full" />
              </span>
              <h1 className="text-[15px] font-bold">
                {formatNumber(balance + refBonus)}
              </h1>
            </div>
          </div>

          <div className="w-full flex items-center justify-between ">
            <div
              onClick={() => handleMenu(1)}
              className={`${
                activeIndex === 1 ? "bg-cards text-[#ebebeb]" : ""
              } rounded-[6px] text-primary py-[10px] px-3 w-[30%] flex space-x-2 justify-center text-center text-[15px] font-semibold items-center cursor-pointer`}
            >
              <PiNotebook size={16} className="" />
              <span>Tasks</span>
            </div>

            <div
              onClick={() => handleMenu(2)}
              className={`${
                activeIndex === 2 ? "bg-cards text-[#ebebeb]" : ""
              } rounded-[6px] text-primary py-[10px] px-3 w-[30%] space-x-2 font-semibold text-[15px] flex justify-center text-center items-center cursor-pointer`}
            >
              <FaBoxes size={16} className="" /> <span>Boost</span>
            </div>

            <div
              onClick={() => handleMenu(3)}
              className={`${
                activeIndex === 3 ? "bg-cards text-[#ebebeb]" : ""
              } rounded-[6px] text-primary py-[10px] px-3 w-[30%] space-x-2 font-semibold text-[15px] flex justify-center text-center items-center cursor-pointer`}
            >
              <FaBoxes size={16} className="" /> <span>Challenges</span>
            </div>
          </div>

          <div className={`${activeIndex === 1 ? "block" : "hidden"}`}>
            <h1 className="text-[24px] font-semibold">Earn more tokens</h1>
            <p className="text-[14px] leading-[24px]">
              Perform tasks daily to earn more Shaka tokens and level up real
              quick!
            </p>
            <TaskTabs
              activeTaskTab={activeTaskTab}
              setActiveTaskTab={setActiveTaskTab}
              taskType={taskType}
              setTaskType={setTaskType}
              taskCounts={getTaskCounts()}
            />
          </div>

          <div className={`${activeIndex === 2 ? "block" : "hidden"}`}>
            <h1 className="text-[24px] font-semibold">Boost your earnings</h1>
            <p className="text-[14px] text-[#c6c6c6] leading-[24px] pb-7">
              Multiply your rewards and accelerate your earnings!
            </p>
            <Boost />
          </div>

          <div className={`${activeIndex === 3 ? "block" : "hidden"}`}>
            <h1 className="text-[24px] font-semibold">Milestone rewards</h1>
            <p className="text-[14px] text-[#c6c6c6] leading-[24px]">
              Complete specific milestones to unlock huge rewards and bonuses!
            </p>
          </div>

          <div id="refer" className="w-full  rounded-[10px] pt-2 pb-[180px]">
            <div
              className={`${
                activeIndex === 1 ? "block" : "hidden"
              } w-full flex items-end justify-center flex-col space-y-4`}
            >
              {getFilteredTasks().map((task) => (
                <TasksContent
                  key={task.id}
                  task={task}
                  taskType={taskType}
                  attemptStatus={taskAttempts[task.id]}
                  onTaskClaimed={() => fetchTasksAndAttempts()}
                />
              ))}
            </div>

            <div
              className={`${
                activeIndex === 3 ? "block" : "hidden"
              } w-full flex items-end justify-center flex-col space-y-4`}
            >
              <MilestoneRewards />
            </div>
          </div>

          <Levels showLevel={showLevel} setShowLevel={setShowLevel} />
        </div>
        <Outlet />
      </Animate>
    </ErrorBoundary>
  );
};

export default TasksList;
