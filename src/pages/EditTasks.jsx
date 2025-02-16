import React from "react";
import AdminPanel from "../components/AdminPanel";
import { Outlet } from "react-router-dom";

const EditTasks = () => {
  return (
    <div className="min-h-screen">
      <AdminPanel collection="telegramTasks" />
      <Outlet />
    </div>
  );
};

export default EditTasks;
