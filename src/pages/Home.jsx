import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "../App.css";
import "../fire.scss";
import { AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import { UserProvider } from "../context/userContext";

const tele = window.Telegram?.WebApp;
const Home = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Telegram WebApp is available
    if (tele) {
      tele.ready();
      tele.expand();

      // Set header color
      tele.setHeaderColor("#1b1b1b");

      // Haptic feedback
      if (tele.HapticFeedback) {
        tele.HapticFeedback.impactOccurred("medium");
      }
    }

    // Fallback vibration for non-Telegram browsers
    tryVibrate(200);

    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  // Add a function to safely handle vibration
  const tryVibrate = (duration) => {
    if (navigator.vibrate && window === window.top) {
      // Check if we're not in an iframe
      try {
        navigator.vibrate(duration);
      } catch (e) {
        console.log("Vibration not supported or blocked");
      }
    }
  };

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="w-full flex justify-center">
          <div className="flex flex-col pt-3 space-y-3 w-full">
            <UserProvider>
              <AnimatePresence mode="wait">
                <Outlet />

                <div
                  id="footermain"
                  className={`${
                    loading ? "invisible" : "visible"
                  } z-30 flex flex-col fixed bottom-0 py-6 left-0 right-0 justify-center items-center px-3 `}
                >
                  <Footer />
                </div>
              </AnimatePresence>
            </UserProvider>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
