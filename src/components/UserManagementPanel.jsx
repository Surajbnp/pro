import { useState } from "react";
import SearchBar from "../components/UserManagementPanel/SearchBar";
import TabSelector from "../components/UserManagementPanel/TabSelector";
import UsersList from "../components/UserManagementPanel/UsersList";

const UserManagementPanel = () => {
  const [activeTab, setActiveTab] = useState("telegram");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-6 pb-20 flex flex-col ">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeTab={activeTab}
        />
        <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
        <UsersList activeTab={activeTab} />
      </div>
    </div>
  );
};

export default UserManagementPanel;
