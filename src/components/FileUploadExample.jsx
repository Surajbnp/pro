import React, { useState } from "react";
import { uploadFile } from "../utils/fileUpload";

const FileUploadExample = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setError(null);
    setUploading(true);

    try {
      const result = await uploadFile(file, "tasks"); // 'tasks' is the folder name
      setFileUrl(result.url);
      console.log("File uploaded successfully:", result);
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} disabled={uploading} />

      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {fileUrl && (
        <div>
          <p>File uploaded successfully!</p>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            View uploaded file
          </a>
        </div>
      )}
    </div>
  );
};

export default FileUploadExample;
