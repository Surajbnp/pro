import React from "react";

const Spinner = () => {
  return (
    <div className="fixed left-0 loadingBg right-0 top-0 bottom-0 flex w-full items-center justify-center z-[60]">
      <div className="loading-bar absolute top-0">
        <div className="progress-bar"></div>
      </div>
      <div className="spinner">
        <div className="spinner-box">
          <div className="blue-orbit leo"></div>

          <div className="green-orbit leo"></div>

          <div className="red-orbit leo"></div>

          <div className="white-orbit w1 leo"></div>
          <div className="white-orbit w2 leo"></div>
          <div className="white-orbit w3 leo"></div>
        </div>
      </div>
    </div>
  );
};

export default Spinner;
