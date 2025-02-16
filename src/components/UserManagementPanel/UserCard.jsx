import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { toast } from "react-hot-toast";
import { useState } from "react";

const UserCard = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editUserData, setEditUserData] = useState(user);

  const handleUpdateUser = async () => {
    try {
      const collectionName =
        user.type === "telegram" ? "telegramUsers" : "users";
      const userDoc = doc(db, collectionName, user.id);
      await updateDoc(userDoc, editUserData);
      toast.success("User successfully updated!");
      onUpdate(editUserData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user: ", error);
      toast.error("Error updating user");
    }
  };

  const handleDeleteUser = async () => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const collectionName =
          user.type === "telegram" ? "telegramUsers" : "users";
        await deleteDoc(doc(db, collectionName, user.id));
        toast.success("User successfully deleted!");
        onUpdate(null);
      } catch (error) {
        console.error("Error deleting user: ", error);
        toast.error("Error deleting user");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-[#2e2e2e] p-6 rounded-lg shadow-lg border border-[#3e3e3e] mb-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">User Details</h3>
          <div className="space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-[#f5bb5f] hover:text-[#e5ab4f] transition-colors"
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
            <button
              onClick={handleDeleteUser}
              className="text-red-500 hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                User ID
              </label>
              <input
                type="text"
                value={user.id}
                disabled
                className="w-full bg-[#3e3e3e] text-gray-300 px-3 py-2 rounded-md"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={editUserData.username || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#3e3e3e] text-white px-3 py-2 rounded-md focus:ring-1 focus:ring-[#f5bb5f] outline-none"
                />
              ) : (
                <div className="bg-[#3e3e3e] text-white px-3 py-2 rounded-md">
                  {user.username || "N/A"}
                </div>
              )}
            </div>

            {/* Balance */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Balance
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="balance"
                  value={editUserData.balance || 0}
                  onChange={handleInputChange}
                  className="w-full bg-[#3e3e3e] text-white px-3 py-2 rounded-md focus:ring-1 focus:ring-[#f5bb5f] outline-none"
                />
              ) : (
                <div className="bg-[#3e3e3e] text-white px-3 py-2 rounded-md">
                  {user.balance || 0}
                </div>
              )}
            </div>

            {/* Referral Code */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Referral Code
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="referralCode"
                  value={editUserData.referralCode || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#3e3e3e] text-white px-3 py-2 rounded-md focus:ring-1 focus:ring-[#f5bb5f] outline-none"
                />
              ) : (
                <div className="bg-[#3e3e3e] text-white px-3 py-2 rounded-md">
                  {user.referralCode || "N/A"}
                </div>
              )}
            </div>

            {/* Referred By */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Referred By
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="referredBy"
                  value={editUserData.referredBy || ""}
                  onChange={handleInputChange}
                  className="w-full bg-[#3e3e3e] text-white px-3 py-2 rounded-md focus:ring-1 focus:ring-[#f5bb5f] outline-none"
                />
              ) : (
                <div className="bg-[#3e3e3e] text-white px-3 py-2 rounded-md">
                  {user.referredBy || "N/A"}
                </div>
              )}
            </div>

            {/* Total Referrals */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Total Referrals
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="totalReferrals"
                  value={editUserData.totalReferrals || 0}
                  onChange={handleInputChange}
                  className="w-full bg-[#3e3e3e] text-white px-3 py-2 rounded-md focus:ring-1 focus:ring-[#f5bb5f] outline-none"
                />
              ) : (
                <div className="bg-[#3e3e3e] text-white px-3 py-2 rounded-md">
                  {user.totalReferrals || 0}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <button
              onClick={handleUpdateUser}
              className="w-full bg-[#f5bb5f] text-black font-medium py-2 rounded-lg mt-4 hover:bg-[#e5ab4f] transition-colors"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
