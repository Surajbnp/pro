import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { toast } from "react-hot-toast";
import UserCard from "./UserCard";

const UsersList = ({ activeTab }) => {
  const [users, setUsers] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);

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
      setUsers(loadMore ? [...users, ...fetchedUsers] : fetchedUsers);
    } catch (error) {
      console.error("Error fetching users: ", error);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUsers([]);
    setLastVisible(null);
    fetchUsers();
  }, [activeTab]);

  const handleUserUpdate = (updatedUser) => {
    if (!updatedUser) {
      // User was deleted
      setUsers(users.filter((u) => u.id !== updatedUser.id));
    } else {
      // User was updated
      setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    }
  };
  return (
    <div className="">
      <h2 className="text-xl font-semibold text-white mb-4">Users List</h2>
      <div className="space-y-4">
        {users.map((user) => (
          <UserCard key={user.id} user={user} onUpdate={handleUserUpdate} />
        ))}

        {users.length > 0 && (
          <button
            onClick={() => fetchUsers(true)}
            disabled={loading}
            className="w-full bg-[#4b4b4b] text-white py-3 rounded-lg hover:bg-[#5b5b5b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {loading ? "Loading..." : "Load More Users"}
          </button>
        )}
      </div>
    </div>
  );
};

export default UsersList;
