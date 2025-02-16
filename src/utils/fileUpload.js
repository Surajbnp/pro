import { storage } from "../firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const uploadFile = async (file, folder = "general") => {
  try {
    // File validation
    if (!file) {
      throw new Error("No file provided");
    }
    console.log("file validation passed", file);
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds 5MB limit");
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error("File type not supported");
    }

    // Create a unique filename
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    // Create reference to storage
    const storageRef = ref(storage, `${folder}/${fileName}`);
    console.log("storage reference created", storageRef);
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    console.log("file uploaded");

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("download URL fetched");
    return {
      url: downloadURL,
      fileName: fileName,
      originalName: file.name,
      fileType: file.type,
      folder: folder,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const validateFile = (file) => {
  if (!file) {
    return { isValid: false, error: "No file provided" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: "File size exceeds 5MB limit" };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { isValid: false, error: "File type not supported" };
  }

  return { isValid: true, error: null };
};
