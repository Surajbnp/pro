import React from "react";
import "./index.css";
import { createBrowserRouter } from "react-router-dom";

import Home from "./pages/Home";
import ErrorCom from "./components/ErrorCom";
import Boost from "./pages/Boost";
import Wallet from "./pages/Wallet";
import TasksList from "./pages/Tasks";
import ReferralRewards from "./pages/Rewards";
import Dashboard from "./pages/Dashboard";
import NotAdmin236 from "./pages/NotAdmin236";
import Settings from "./pages/Settings";
import EditTasks from "./pages/EditTasks";
import ExtrenalTasks from "./pages/ExtrenalTasks";
import Search from "./pages/Search";
import Statistics from "./pages/Statistics";
import GoldHunters from "./pages/GoldHunters";
import Ref from "./pages/Ref";
import LoginComp from "./components/LoginComp";
import Arcade from "./pages/Arcade";
import AdminCreate from "./components/AdminCreate";
import ProtectedRoute from "./components/ProtectedRoute";
import TaskCompletions from "./components/adminTaskComponents/TaskCompletions";
import UserProfile from "./pages/UserProfile";
import WalletDashboard from "./pages/WalletDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorCom />,
    children: [
      {
        path: "/",
        element: <GoldHunters />,
      },
      {
        path: "/login",
        element: <LoginComp />,
      },
      {
        path: "/ref",
        element: <Ref />,
      },
      {
        path: "/tasks",
        element: <TasksList />,
      },
      {
        path: "/arcade",
        element: <Arcade />,
      },
      {
        path: "/wallet",
        element: <Wallet />,
      },
      {
        path: "/wallet-dashboard",
        element: <WalletDashboard />,
      },
      {
        path: "/rewards",
        element: <ReferralRewards />,
      },
      {
        path: "/dashboardadmin36024x",
        element: <NotAdmin236 />,
      },
      {
        path: "/create-admin",
        element: <AdminCreate />,
      },
      {
        path: "/user-profile",
        element: <UserProfile />,
      },
    ],
  },
  {
    path: "/dashboardAdx",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    errorElement: <ErrorCom />,
    children: [
      {
        path: "/dashboardAdx/settings",
        element: <Settings />,
      },
      {
        path: "/dashboardAdx/managetasks",
        element: <EditTasks />,
      },
      {
        path: "/dashboardAdx/externaltasks",
        element: <ExtrenalTasks />,
      },
      {
        path: "/dashboardAdx/search",
        element: <Search />,
      },
      {
        path: "/dashboardAdx/stats",
        element: <Statistics />,
      },
      {
        path: "/dashboardAdx/task-completions/:taskId",
        element: <TaskCompletions />,
      },
      {
        path: "/dashboardAdx/create-admin",
        element: <AdminCreate />,
      },
    ],
  },
]);

export default router;
