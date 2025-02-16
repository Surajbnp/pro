const TabSelector = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex justify-center space-x-4 mb-10">
      <button
        onClick={() => setActiveTab("telegram")}
        className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
          activeTab === "telegram"
            ? "bg-[#f5bb5f] text-black"
            : "bg-[#4b4b4b] hover:bg-[#5b5b5b] text-white"
        }`}
      >
        Telegram Users
      </button>
      <button
        onClick={() => setActiveTab("web")}
        className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
          activeTab === "web"
            ? "bg-[#f5bb5f] text-black"
            : "bg-[#4b4b4b] hover:bg-[#5b5b5b] text-white"
        }`}
      >
        Web Users
      </button>
    </div>
  );
};

export default TabSelector;
