"use client";
import Login from "../../components/auth/Login";
import { useAuth } from "../../auth/AuthContext";
import { Navigate } from "react-router-dom";

const LoginView = () => {
  const { isAuthenticated, loading } = useAuth();

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return <Login />;
};
export default LoginView;