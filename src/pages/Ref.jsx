import React, { useEffect, useState } from "react";
import Animate from "../components/Animate";
import { NavLink, Outlet } from "react-router-dom";
import { FaLink } from "react-icons/fa6";
import { MdOutlineFileUpload } from "react-icons/md";
import { useUser } from "../context/userContext";
import whatsapp from "../images/whatsapp.svg";
import twitter from "../images/twitter.svg";
import telegram from "../images/telegram.svg";
import facebook from "../images/facebook.svg";
import { RxArrowRight } from "react-icons/rx";
import MateCard from "../components/MateCard";
import Spinner from "../components/Spinner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const Ref = () => {
  const { id, refBonus, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const [allReferrals, setAllReferrals] = useState([]);
  const [copied, setCopied] = useState(false);

  const fetchReferrals = async () => {
    try {
      const docRef = doc(db, "referrals", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { usersSignedUp = [], claimedUsers = [] } = docSnap.data();
        // Combine both arrays and remove duplicates
        const allUniqueReferrals = [
          ...new Set([...usersSignedUp, ...claimedUsers]),
        ];
        setAllReferrals(allUniqueReferrals);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    // eslint-disable-next-line
    const tgLink = `https://t.me/Primemates_bot?profile?start=r${id}`;
    const webLink = `https://app.primearcade.io?ref=${id}`;
    const message = `Shaka tokens mining is live! Two is better than one! Join my squad, and let's double the fun (and earnings 🤑)! Prime Mates Power Tap! 🚀\n\nTelegram: ${tgLink}\nWebsite: ${webLink}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(message)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 10000);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    } else {
      // Fallback method
      const textArea = document.createElement("textarea");
      textArea.value = message;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset the copied state after 2 seconds
      } catch (err) {
        console.error("Failed to copy", err);
      }
      document.body.removeChild(textArea);
    }
  };

  const formatNumber = (num) => {
    if (num < 100000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    } else if (num < 1000000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    } else {
      return (num / 1000000).toFixed(3).replace(".", ".") + " M";
    }
  };

  const handleShare = async () => {
    const tgLink = `https://t.me/Primemates_bot?profile?start=r${id}`;
    const webLink = `https://app.primearcade.io?ref=${id}`;

    const shareData = {
      title: "Mine SHAKA tokens now!",
      url: webLink,
      text: `SHAKA tokens mining is live! Two is better than one! Join my squad, and let's double the fun (and earnings 🤑)! Prime mates Power Tap! 🚀\n\nTelegram: ${tgLink}\nWebsite: ${webLink}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log("Content shared successfully");
      } catch (error) {
        console.error("Error sharing content:", error);
      }
    } else {
      fallbackShare(shareData);
    }
  };

  const fallbackShare = (shareData) => {
    const encodedText = encodeURIComponent(shareData.text);
    const encodedUrl = encodeURIComponent(shareData.url);

    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    const telegramUrl = `https://telegram.me/share/url?text=${encodedText}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    const fallbackOptions = [
      { name: "WhatsApp", url: whatsappUrl, icon: whatsapp },
      { name: "Telegram", url: telegramUrl, icon: telegram },
      { name: "Twitter", url: twitterUrl, icon: twitter },
      { name: "Facebook", url: facebookUrl, icon: facebook },
    ];

    const optionsHtml = fallbackOptions
      .map(
        (option) =>
          `<li key="${option.name}" style="display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
  "">
        <a href="${option.url}" target="_blank" rel="noopener noreferrer">
        <img alt="daxy" src=${option.icon} width="50px"/>
        </a>
        <span style="
    font-size: 12px;
    color: #000;
    padding-top: 4px;
    font-weight: 500;
">${option.name}</span>
      </li>`
      )
      .join("");

    const fallbackHtml = `
     <div id="fallback-share-popup" style="z-index:40; position: fixed;top: 0;background:#0000007d;left: 0;right: 0;bottom: 0;display: flex;justify-content: center; align-items: start;
     flex-direction: column;"> 
     <div id="close-popup-button" style="
    width: 100%;
    height: 70%;
"></div>
     <div style="background: #fff;padding: 20px 24px;width: 100%;box-shadow: 0 0 10px rgba(0,0,0,0.1);height: 30%;border-top-right-radius: 16px;border-top-left-radius:16px">
        <h3 style=" font-size: 18px;
        font-weight: 600;
        color: #313131;
        padding-bottom: 12px;
        width: 100%;
        text-align: center;
        ">Share via</h3>
        <ul style="display: flex;
        justify-content: space-between;
        gap: 10px">
          ${optionsHtml}
        </ul>
        
        <div style="
    width: 100%;
    padding: 30px 10px 0;
    display: flex;
    justify-content: center;
">
<button id="close-popup-button2" style="
    background: #000000d4;
    padding: 6px 14px;
    font-weight: 500;
    border-radius: 6px;
">Close</button>
</div>

      </div>
      </div>
    `;

    const fallbackPopup = document.createElement("div");
    fallbackPopup.innerHTML = fallbackHtml;
    document.body.appendChild(fallbackPopup);

    document.getElementById("close-popup-button").onclick = () => {
      document.getElementById("fallback-share-popup").remove();
    };
    document.getElementById("close-popup-button2").onclick = () => {
      document.getElementById("fallback-share-popup").remove();
    };
  };

  useEffect(() => {
    if (id) {
      fetchReferrals();
    }
  }, [id]);

  return (
    <>
      <Animate>
        <div className="w-full pt-3 justify-center flex-col space-y-3 px-5">
          <div className="w-full">
            <h1 className="font-semibold text-[18px] text-[#ffffffe0] pb-1">
              Invite friends, get rewards!
            </h1>
            <p className="text-[13px] text-[#d0d0d0] w-full pr-4 pb-1">
              More Mates , more rewards! more milestones to unlock!
            </p>
          </div>

          <div className="w-full flex items-center justify-between space-x-[10px] pb-2">
            <button
              onClick={handleShare}
              className="w-[65%] flex space-x-2 text-accent font-medium text-[14px] barTitle bg-cards3 h-[55px] rounded-[10px] px-4 justify-center items-center text-center"
            >
              <span className="flex items-center mt-[-1px]">
                <MdOutlineFileUpload size={18} className="" />
              </span>
              <span className="">Share invite link</span>
            </button>
            <button
              onClick={copyToClipboard}
              className="w-[35%] flex space-x-2 text-accent font-medium text-[14px] barTitle bg-cards3 h-[55px] rounded-[10px] px-4 justify-center items-center text-center"
            >
              <span className="flex items-center">
                <FaLink size={18} className="" />
              </span>
              <span className="">
                {copied ? <span>Copied!</span> : <span>Copy</span>}
              </span>
            </button>
          </div>

          <div className="w-full flex items-center justify-between space-x-3 pb-3">
            <div className="w-[48.5%] flex flex-col text-[#000] font-medium text-[14px] bg-cards h-[85px] rounded-[10px] px-4 py-2 justify-start text-left relative">
              <h2 className="!m-0 font-semibold text-[#fff]">
                {loading || userLoading ? (
                  <Spinner />
                ) : (
                  <>
                    <span className="text-[22px]">{allReferrals.length}</span>{" "}
                    <span className=""> MATES</span>
                  </>
                )}
              </h2>
              <p className="text-[10px] small-text3 text-[#ffffff9e] max-w-[10em]">
                More Mates, better rewards
              </p>
            </div>
            <div className="w-[48.5%] flex flex-col text-[#000] font-medium text-[14px] bg-cards h-[85px] rounded-[10px] px-4 py-2 justify-start text-left relative">
              <h2 className="!m-0 font-semibold text-[#fff]">
                <span className="text-[22px]">
                  {formatNumber(refBonus || 0)}
                </span>
                <span className="text-[18px]"> SHAKA</span>
              </h2>
              <div className="w-full flex items-start justify-between">
                <p className="text-[10px] text-[#ffffff9e] small-text3 max-w-[10em]">
                  Both of you earn 50000 SHAKA coins
                </p>
              </div>
            </div>
          </div>

          <div className="w-full flex justify-between items-center">
            <h3 className="font-semibold small-text text-[17px] text-[#ffffffe0] pl-1">
              Mates list
            </h3>

            <NavLink
              to="/rewards"
              className="bg-cards3 small-text2 font-medium py-2 px-3 text-[#e7e7e7d6] flex items-center space-x-2 text-[14px] text rounded-[6px]"
            >
              <span>Claim rewards</span>{" "}
              <RxArrowRight size={14} className="text-btn4 mt-[2px]" />
            </NavLink>
          </div>

          <div id="refer" className="w-full rounded-[10px] pt-2 pb-32">
            {loading || userLoading ? (
              <p className="text-[#d0d0d0] w-full text-center">checking...</p>
            ) : allReferrals.length === 0 ? (
              <p className="text-[#d0d0d0] text-center w-full now pt-8 px-5 text-[14px] leading-[24px]">
                You have no mates 👨‍👦‍👦 Refer your mates and family, get 50000
                SHAKA coins for both of you
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:grid-cols-3">
                {allReferrals.map((userId) => (
                  <MateCard key={userId} userId={userId} />
                ))}
              </div>
            )}
          </div>
        </div>
        <Outlet />
      </Animate>
    </>
  );
};

export default Ref;
