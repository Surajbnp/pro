import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdmin } from "../contexts/AdminContext";
import Spinner from "./Spinner";

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAdmin();
  const location = useLocation();
  if (loading) {
    return <Spinner />;
  }

  if (!admin) {
    return (
      <Navigate to="/dashboardadmin36024x" state={{ from: location }} replace />
    );
  }

  return children;
};

export default ProtectedRoute;
