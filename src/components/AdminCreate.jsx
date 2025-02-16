import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import FormControls from "./FormControl";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoCheckmarkCircle, IoWarningOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const AdminCreate = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const navigate = useNavigate();
  const handleForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const auth = getAuth();
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Add user to admins collection
      const db = getFirestore();
      await setDoc(doc(db, "admins", user.uid), {
        email: user.email,
        password: password,
        createdAt: new Date().toISOString(),
        role: "admin",
      });
      toast.success("Admin account created successfully!");
      setEmail("");
      setPassword("");
      navigate("/dashboardAdx/stats");
    } catch (error) {
      setErrorCode(error.message);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="form-wrapper flex flex-col items-start">
        <div className="w-full text-center pb-4">
          <h1 className="text-[24px] sm:text-[28px] font-medium pb-1">
            Create Admin Account
          </h1>
          <p className="text-[#b0b0b0] text-[14px] sm:text-[13px] font-light">
            Create a new administrator account
          </p>
        </div>
        <div className="w-full flex flex-col items-center space-y-3 sm:space-y-4">
          <FormControls
            label="Email"
            type="email"
            id="email"
            placeholder="Admin email"
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
                    Creating Admin
                    <AiOutlineLoading3Quarters
                      size={18}
                      className="animate-spin ml-[12px]"
                    />
                  </>
                ) : (
                  "Create Admin"
                )}
              </button>
            </div>
            <Link
              to="/dashboardAdx/stats"
              className="mt-3 text-gray-500 group relative flex items-center gap-1 transition-all duration-300 hover:text-[#c2fa7c]"
            >
              <span className="relative">
                Go to Dashboard
                <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-[#c2fa7c] transition-all duration-300 group-hover:w-full" />
              </span>
              <svg
                className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {errorCode && (
        <div className="z-[60] ease-in duration-300 w-full fixed left-0 right-0 px-4 top-6">
          <div className="w-full text-[#ff4d4d] flex items-center space-x-2 px-4 bg-[#121620ef] h-[50px] rounded-[8px]">
            <IoWarningOutline size={16} />
            <span className="text-[15px]">{errorCode}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCreate;
