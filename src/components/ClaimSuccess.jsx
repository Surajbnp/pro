import React from "react";

const ClaimSuccess = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
      <div className="bg-gray-700 rounded-lg p-6 text-center max-w-sm w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <div className="w-40 h-40 mx-auto mb-4">
          <img
            src="/congrats.gif"
            alt="Congratulations"
            className="w-full h-full object-contain"
          />
        </div>

        <h3 className="text-xl font-bold text-[#FBC535] mb-2">
          Task Claimed Successfully!
        </h3>
        <p className="text-gray-300 text-sm mb-4">
          Complete the task to earn your points. Good luck!
        </p>

        <button
          onClick={onClose}
          className="bg-[#FBC535] text-black px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-300"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default ClaimSuccess;
