import React, { useState, useEffect } from "react";
import { db } from "../firebase/firestore"; // adjust the path as needed
import { collection, getDocs, query } from "firebase/firestore";
import moment from "moment";
import { NavLink } from "react-router-dom";
import { PiArrowRight } from "react-icons/pi";
import Spinner from "./Spinner";

const linksTo = [
  {
    link: "/dashboardAdx/managetasks",
    title: "Telegram Tasks",
  },
  {
    link: "/dashboardAdx/externaltasks",
    title: "Social Media Tasks",
  },
  {
    link: "/dashboardAdx/search",
    title: "User Management",
  },
  {
    link: "/dashboardAdx/settings",
    title: "Settings",
  },
];

const StatisticsPanel = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalTapBalance, setTotalTapBalance] = useState(0);
  const [telegramUsers, setTelegramUsers] = useState([]);
  const [webUsers, setWebUsers] = useState([]);
  const [activeUsersLast24Hours, setActiveUsersLast24Hours] = useState(0);
  const [activeUsersLast1Hour, setActiveUsersLast1Hour] = useState(0);
  const [activeUsersLast1Minute, setActiveUsersLast1Minute] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Fetch Telegram users
      const telegramUsersQuery = query(collection(db, "telegramUsers"));
      const telegramSnapshot = await getDocs(telegramUsersQuery);
      const telegramUsersData = telegramSnapshot.docs.map((doc) => ({
        ...doc.data(),
        createdAt: doc.createTime,
      }));
      setTelegramUsers(telegramUsersData);

      // Fetch Web users
      const webUsersQuery = query(collection(db, "users"));
      const webSnapshot = await getDocs(webUsersQuery);
      const webUsersData = webSnapshot.docs.map((doc) => ({
        ...doc.data(),
        createdAt: doc.createTime,
      }));
      setWebUsers(webUsersData);

      // Calculate total users
      const totalTelegramUsers = telegramUsersData.length;
      const totalWebUsers = webUsersData.length;
      setTotalUsers(totalTelegramUsers + totalWebUsers);

      // Calculate balances
      const telegramBalances = telegramUsersData.reduce(
        (acc, user) => ({
          balance: acc.balance + (user.balance || 0),
          tapBalance: acc.tapBalance + (user.tapBalance || 0),
        }),
        { balance: 0, tapBalance: 0 }
      );

      const webBalances = webUsersData.reduce(
        (acc, user) => ({
          balance: acc.balance + (user.balance || 0),
          tapBalance: acc.tapBalance + (user.tapBalance || 0),
        }),
        { balance: 0, tapBalance: 0 }
      );

      // Set total balances
      setTotalBalance(telegramBalances.balance + webBalances.balance);
      setTotalTapBalance(telegramBalances.tapBalance + webBalances.tapBalance);

      setActiveUsersLast24Hours(0);
      setActiveUsersLast1Hour(0);
      setActiveUsersLast1Minute(0);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (typeof num !== "number") {
      return "Invalid number";
    }

    // If the number is less than 1 and has more than 3 decimal places
    if (num < 1 && num.toString().split(".")[1]?.length > 3) {
      return num.toFixed(6).replace(/0+$/, ""); // Trims trailing zeroes
    }

    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const statista = [
    {
      title: "Total Users",
      count: totalUsers,
    },
    {
      title: "Telegram Users",
      count: telegramUsers?.length || 0,
    },
    {
      title: "Web Users",
      count: webUsers?.length || 0,
    },
    {
      title: "Total Balance",
      count: formatNumber(totalBalance),
    },
    {
      title: "Total Taps",
      count: formatNumber(totalTapBalance),
    },
  ];

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div className="w-full flex flex-col space-y-4 pt-4 pb-[150px]">
          <div className="w-full flex justify-start items-start flex-wrap gap-4">
            {statista.map((stats, index) => (
              <div
                key={index}
                className={`bg-cards p-4 rounded-[10px] w-[47%] sm:w-[32%] h-[120px] flex flex-col justify-center space-y-3 ${
                  statista.length === 5 ? "last:w-full sm:last:w-[64%]" : ""
                }`}
              >
                <h2 className="text-[16px] sm:text-[18px] font-semibold text-[#bdbdbd]">
                  {stats.title}
                </h2>
                <span className="text-[20px] sm:text-[24px] text-[#fff] font-bold">
                  {stats.count}
                </span>
              </div>
            ))}
          </div>
          <h2 className="font-semibold text-[17px] pt-3">
            Admin Control Items
          </h2>

          <div className="flex flex-col space-y-4 w-full">
            {linksTo.map((menu, index) => (
              <NavLink
                to={menu.link}
                key={index}
                className={`bg-cards px-4 py-4 flex rounded-[6px] justify-between items-center space-x-1 font-medium`}
              >
                <span className="">{menu.title}</span>
                <span className="">
                  <PiArrowRight size={16} className="" />
                </span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default StatisticsPanel;
