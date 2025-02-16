import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "@firebase/firestore";
import { useState } from "react";
import { db } from "../../firebase/config";
import toast from "react-hot-toast";
import UserCard from "./UserCard";

const SearchBar = ({ searchTerm, setSearchTerm, activeTab }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const fetchUsers = async (loadMore = false) => {
    setLoading(true);
    try {
      const collectionName =
        activeTab === "telegram" ? "telegramUsers" : "users";
      const usersRef = collection(db, collectionName);
      const usersQuery =
        loadMore && lastVisible
          ? query(
              usersRef,
              orderBy("balance", "desc"),
              startAfter(lastVisible),
              limit(50)
            )
          : query(usersRef, orderBy("balance", "desc"), limit(50));

      const userSnapshot = await getDocs(usersQuery);
      const lastVisibleDoc = userSnapshot.docs[userSnapshot.docs.length - 1];
      setLastVisible(lastVisibleDoc);

      const fetchedUsers = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: activeTab,
      }));
      console.log("Fetched Users:", fetchedUsers);
      setUsers(loadMore ? [...users, ...fetchedUsers] : fetchedUsers);
    } catch (error) {
      console.error("Error fetching users: ", error);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetchUsers();
  };

  return (
    <div className="w-full mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by username"
            className="bg-[#4b4b4b] w-full placeholder:text-[#b9b9b9] text-[#e0e0e0] text-[13px] h-[55px] border-none outline-none rounded-lg px-6 pr-12 transition-all duration-200 focus:ring-2 focus:ring-[#f5bb5f]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-[#f5bb5f] text-black px-6 rounded-lg hover:bg-[#e5ab4f] transition-colors h-[55px]"
        >
          Search
        </button>
      </form>
      {searchTerm && (
        <div className="mt-7">
          <h2 className="text-xl font-semibold text-gray-500 text-center mb-4">
            Search Results
          </h2>
          {loading && <p className="text-white">Loading...</p>}
          {users.length === 0 && <p className="text-white">No users found</p>}
          {users.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {users.map((user) => (
                <UserCard user={user} key={user.id} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
