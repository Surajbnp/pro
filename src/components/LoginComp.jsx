import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import signIn from "../firebase/auth/signin";
import FormControls from "./FormControl";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoCheckmarkCircle, IoWarningOutline } from "react-icons/io5";
import Spinner from "./Spinner";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { getAuth } from "firebase/auth";
import firebase_app from "../firebase/config";

const LoginComp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // Success message state
  const auth = getAuth(firebase_app);
  const navigate = useNavigate();
  const [errorCode, setErrorCode] = useState("");
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboardAdx/stats";

  const handleForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorCode("");

    try {
      const { user } = await signIn(email, password);
      if (!user) {
        throw new Error("Authentication failed");
      }
      console.log(user);
      // Check if user is an admin
      const db = getFirestore();
      const adminDoc = await getDoc(doc(db, "admins", user.uid));

      if (adminDoc.exists()) {
        setSuccessMessage("Login successful!");
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1500);
      } else {
        await auth.signOut(); // Sign out if not an admin
        throw new Error("Unauthorized access. Admin privileges required.");
      }
    } catch (error) {
      setErrorCode(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {successMessage ? (
        <Spinner />
      ) : (
        <div className="form-wrapper flex flex-col items-start">
          <div className="w-full text-center pb-4">
            <h1 className="text-[24px] sm:text-[28px] font-medium pb-1">
              Admin Login
            </h1>
            <p className="text-[#b0b0b0] text-[14px] sm:text-[13px] font-light">
              Enter your email and password to login
            </p>
          </div>
          <div className="w-full flex flex-col items-center space-y-3 sm:space-y-4">
            <FormControls
              label="Email"
              type="email"
              id="email"
              placeholder="Your email"
              value={email}
              setValue={setEmail}
            />
            <FormControls
              label="Password"
              type="password"
              id="password"
              placeholder="**********"
              value={password}
              setValue={setPassword}
            />
            <div className="flex flex-col items-center w-full">
              <div className="flex flex-col items-center space-y-6 sm:space-y-4 w-full sm:w-[47%]">
                <button
                  className="bg-[#ffffff] uppercase hover:bg-[#c2fa7c] w-full ease-in duration-300 text-[#000] text-[15px] justify-center text-center font-medium h-[50px] border-none outline-none rounded-[12px] flex items-center px-6"
                  onClick={handleForm}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      Logging in
                      <AiOutlineLoading3Quarters
                        size={18}
                        className="animate-spin ml-[12px]"
                      />
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
                <Link
                  to="/create-admin"
                  className="text-[#b0b0b0] text-[14px] hover:text-[#c2fa7c] transition-colors"
                >
                  Create New Admin Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      {errorCode && (
        <div className="z-[60] ease-in duration-300 w-full fixed left-0 right-0 px-4 top-6">
          <div className="w-full text-[#ff4d4d] flex items-center space-x-2 px-4 bg-[#121620ef] h-[50px] rounded-[8px]">
            <IoWarningOutline size={16} />
            <span className="text-[15px]">{errorCode}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="z-[60] ease-in duration-300 w-full fixed left-0 right-0 px-4 top-6">
          <div className="w-full text-[#4dff4d] flex items-center space-x-2 px-4 bg-[#121620ef] h-[50px] rounded-[8px]">
            <IoCheckmarkCircle size={16} />
            <span className="text-[15px]">{successMessage}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginComp;
