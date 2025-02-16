import React, { useState, useEffect } from "react";
import { db } from "../firebase/firestore";
import {
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import Spinner from "./Spinner";
import { toast } from "react-hot-toast";
import AdminTaskForm from "./adminTaskComponents/AdminTaskForm";
import SuccessModal from "./adminTaskComponents/SuccessModal";
import AdminTaskCard from "./adminTaskComponents/AdminTaskCard";

const AdminPanel = ({ collection: collectionName = "tasks" }) => {
  const [tasks, setTasks] = useState([]);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    bonus: 0,
    id: "",
    link: "",
    icon: "",
    chatId: "",
  });
  const [showTaskInputs, setShowTaskInputs] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const tasksList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTasks(tasksList);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData({
      ...taskData,
      [name]: name === "bonus" ? (value === "" ? "" : Number(value)) : value,
    });
  };

  const handleAddTask = async () => {
    const requiredFields = ["title", "description", "bonus", "chatId"];
    const missingFields = requiredFields.filter((field) => !taskData[field]);

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const newTaskRef = doc(collection(db, collectionName));

      await setDoc(newTaskRef, {
        ...taskData,
        id: newTaskRef.id,
        createdAt: new Date().toISOString(),
      });

      setSuccessMessage("Task successfully added!");
      setShowTaskInputs(false);
      setTaskData({
        title: "",
        description: "",
        bonus: 0,
        link: "",
        icon: "",
        chatId: "",
      });
      fetchTasks();
    } catch (e) {
      console.error("Error adding document: ", e);
      toast.error("Failed to add task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTask = async (updatedTask) => {
    try {
      const taskDoc = doc(db, collectionName, updatedTask.id);
      await updateDoc(taskDoc, {
        title: updatedTask.title,
        description: updatedTask.description,
        bonus: updatedTask.bonus,
        link: updatedTask.link || "",
        icon: updatedTask.icon || "",
        chatId: updatedTask.chatId || "",
      });

      toast.success("Task updated successfully");
      fetchTasks(); // Refresh the tasks list
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (id) => {
    setDeletingTaskId(id);
    try {
      const taskDoc = doc(db, collectionName, id);
      await deleteDoc(taskDoc);
      toast.success("Task deleted successfully");
      fetchTasks();
    } catch (e) {
      console.error("Error deleting document: ", e);
      toast.error("Failed to delete task");
    } finally {
      setDeletingTaskId(null);
    }
  };

  const cancelEdits = () => {
    setIsEditing(false);
    setShowTaskInputs(!showTaskInputs);
    setTaskData({
      title: "",
      description: "",
      bonus: 0,
      id: "",
      link: "",
      icon: "",
      chatId: "",
    });
  };

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div className="w-full flex flex-col space-y-4 pt-4 pb-[150px]">
          <div className="w-fit">
            <button
              onClick={() => setShowTaskInputs(!showTaskInputs)}
              className={`${
                showTaskInputs ? "hidden" : "block"
              } bg-[#f5bb5f] font-semibold text-[15px] rounded-[6px] w-fit px-4 py-3 text-[#000] mb-4`}
            >
              {showTaskInputs ? "Cancel" : "Add new task"}
            </button>
          </div>

          {showTaskInputs && (
            <AdminTaskForm
              taskData={taskData}
              onInputChange={handleInputChange}
              isEditing={isEditing}
              isSubmitting={isSubmitting}
              onSubmit={isEditing ? handleEditTask : handleAddTask}
              onCancel={cancelEdits}
            />
          )}

          <SuccessModal
            message={successMessage}
            isOpen={!!successMessage}
            onClose={() => setSuccessMessage("")}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {tasks.map((task) => (
              <AdminTaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                isDeleting={deletingTaskId === task.id}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPanel;
