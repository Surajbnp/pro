import React from "react";

const AdminTaskForm = ({
  taskData,
  onInputChange,
  isEditing,
  isSubmitting,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="bg-cards p-6 rounded-xl border border-gray-700/30 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {isEditing ? "Edit Task" : "Add New Task"}
        </h2>

        {/* Action Buttons - Moved to top right */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#FBC535] text-black font-medium rounded-lg hover:bg-[#FBC535]/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-1"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </>
            ) : (
              <>{isEditing ? "Update Task" : "Add Task"}</>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Fields - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={taskData.title}
              onChange={onInputChange}
              className="w-full bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700 focus:border-[#FBC535] outline-none"
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={taskData.description}
              onChange={onInputChange}
              rows="4"
              className="w-full bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700 focus:border-[#FBC535] outline-none resize-none"
              placeholder="Enter task description"
              required
            />
          </div>
        </div>

        {/* Side Fields - Takes 1 column */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-800/30 rounded-lg space-y-4">
            <h3 className="font-medium text-[#FBC535] mb-2">Task Details</h3>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Bonus Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="bonus"
                value={taskData.bonus}
                onChange={onInputChange}
                className="w-full bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700 focus:border-[#FBC535] outline-none"
                placeholder="Enter bonus amount"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Chat ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="chatId"
                value={taskData.chatId}
                onChange={onInputChange}
                className="w-full bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700 focus:border-[#FBC535] outline-none"
                placeholder="Enter Telegram chat ID"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Task Link <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="link"
                value={taskData.link}
                onChange={onInputChange}
                className="w-full bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700 focus:border-[#FBC535] outline-none"
                placeholder="Enter task link"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Icon URL
              </label>
              <input
                type="url"
                name="icon"
                value={taskData.icon}
                onChange={onInputChange}
                className="w-full bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700 focus:border-[#FBC535] outline-none"
                placeholder="Enter icon URL (optional)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTaskForm;
