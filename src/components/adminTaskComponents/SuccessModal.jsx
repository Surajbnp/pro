import React from "react";
import { IoCloseCircleSharp } from "react-icons/io5";

const SuccessModal = ({ message, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal fixed w-full h-full top-0 left-0 flex items-center justify-center">
      <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
      <div className="modal-container bg-[#595D65] w-11/12 md:max-w-md mx-auto rounded-[10px] shadow-lg z-50 ">
        <div className="modal-content py-4 text-left px-6">
          <div className="flex justify-end items-center pb-3">
            <div className="modal-close cursor-pointer z-50" onClick={onClose}>
              <IoCloseCircleSharp size={32} className="text-secondary" />
            </div>
          </div>
          <div className="flex justify-center items-center">
            <p>{message}</p>
          </div>
          <div className="flex justify-center pt-2">
            <button
              className="modal-close bg-blue-500 text-white p-2 px-6 rounded"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
