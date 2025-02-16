import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { PiUsersThreeFill } from "react-icons/pi";
import { PiNotebookFill } from "react-icons/pi";
import { PiHandTapFill } from "react-icons/pi";
import { PiGameControllerFill } from "react-icons/pi";
import { IoWalletSharp } from "react-icons/io5";
import { useUser } from "../context/userContext";
import { useAdmin } from "../contexts/AdminContext";

const Footer = () => {
  const location = useLocation();
  const { selectedExchange, id, initialized } = useUser();
  const { admin } = useAdmin();
  if (!initialized) {
    return null;
  }

  // Don't render if user is not logged in
  if (!id) {
    return null;
  }

  // Don't render if user is an admin or on admin-related paths
  if (
    admin ||
    location.pathname.includes("/dashboardAdx") ||
    location.pathname === "/dashboardadmin36024x" ||
    location.pathname === "/create-admin"
  ) {
    return null;
  }

  const footerLinks = [
    {
      title: "Mates",
      link: "/ref",
      icon: (
        <PiUsersThreeFill
          size={22}
          className={location.pathname === "/mongo" ? "w-[26px] h-[26px]" : ""}
        />
      ),
    },
    {
      title: "Tasks",
      link: "/tasks",
      icon: (
        <PiNotebookFill
          size={20}
          className={location.pathname === "/tasks" ? "w-[26px] h-[26px]" : ""}
        />
      ),
    },
    {
      title: "Earn",
      link: "/",
      icon:
        selectedExchange.id === "selectex" ? (
          <PiHandTapFill
            size={20}
            className={location.pathname === "/" ? "w-[26px] h-[26px]" : ""}
          />
        ) : (
          <img
            id={selectedExchange.id}
            src={selectedExchange.icon}
            alt="selected"
            className="w-[26px]"
          />
        ),
    },
    {
      title: "Arcade",
      link: "/arcade",
      icon: (
        <PiGameControllerFill
          size={20}
          className={location.pathname === "/arcade" ? "w-[26px] h-[26px]" : ""}
        />
      ),
    },
    {
      title: "Airdrop",
      link: "/wallet",
      icon: (
        <IoWalletSharp
          size={20}
          className={location.pathname === "/wallet" ? "w-[26px] h-[26px]" : ""}
        />
      ),
    },
  ];

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center px-4 z-30">
      <div className="w-full flex items-center px-[8px] h-[72px] justify-center space-x-2 bg-black border-[#FBC535] pb-[3px] border-[1px] rounded-[35px]">
        {footerLinks.map((footer, index) => (
          <NavLink
            id="reels"
            key={index}
            to={footer.link}
            className={({ isActive }) =>
              isActive
                ? "w-[20%] py-3 flex flex-col h-[60px] px-[6px] mt-1 rounded-[10px] bg-[#111111] items-center justify-center text-[#FBC535] text-[13px] first:rounded-tl-[22px] first:rounded-bl-[22px] last:rounded-tr-[22px] last:rounded-br-[22px]"
                : "w-[20%] py-3 flex flex-col space-y-[2px] rounded-[10px] items-center justify-center text-[#666666] text-[13px] hover:text-[#FBC535] transition-colors"
            }
          >
            <div
              id="reels2"
              className={
                location.pathname === `${footer.link}`
                  ? "space-y-[2px] flex flex-col rounded-[10px] items-center justify-center text-[#FBC535] text-[12px]"
                  : "flex flex-col space-y-[4px] rounded-[10px] items-center justify-center text-[#666666] text-[12px] hover:text-[#FBC535] transition-colors"
              }
            >
              {footer.icon}
              <span
                className={`${
                  location.pathname === `${footer.link}`
                    ? "text-[#FBC535]"
                    : "text-[#666666] hover:text-[#FBC535]"
                } font-medium mb-[-2px] transition-colors`}
              >
                {footer.title}
              </span>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Footer;
