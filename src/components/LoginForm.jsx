import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "react-hot-toast";

const LoginForm = ({ onToggleAuth, setShowAuthForm }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Fetch additional user data from Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (!userDoc.exists()) {
        toast.error("User profile not found");
        return;
      }
      toast.success("Login successful!");
      setShowAuthForm(false);
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = (() => {
        switch (error.code) {
          case "auth/user-not-found":
            return "No account found with this email";
          case "auth/wrong-password":
            return "Invalid password";
          case "auth/invalid-email":
            return "Invalid email format";
          case "auth/too-many-requests":
            return "Too many failed attempts. Please try again later";
          default:
            return "Login failed. Please try again";
        }
      })();
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6 ">
      <h2 className="text-[24px] font-medium text-center text-white">
        Welcome Back
      </h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[14px] text-[#dedede]">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full bg-[#303030] text-white rounded-[12px] p-3 focus:outline-none"
            placeholder="Enter your email"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[14px] text-[#dedede]">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full bg-[#303030] text-white rounded-[12px] p-3 focus:outline-none"
            placeholder="Enter your password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            loading ? "bg-[#404040]" : "bg-btn4"
          } text-black font-medium rounded-[12px] p-3 flex items-center justify-center`}
        >
          {loading ? (
            <span className="flex items-center">
              Logging in...
              <AiOutlineLoading3Quarters className="ml-2 animate-spin" />
            </span>
          ) : (
            "Login"
          )}
        </button>
        <div className="text-center text-[14px] text-[#dedede]">
          <p>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onToggleAuth}
              className="text-btn4 hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
