import React, { useState } from "react";
import api from "../../services/api";

const ProfileEdit = ({ resumeUrl }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("resume", file);

    try {
      await api.put("/users/update-resume", formData);
      setMessage("Resume updated!");
    } catch (err) {
      setMessage("Upload failed");
    }
  };

  return (
    <div>
      <label className="block font-medium mb-1">Update Resume</label>
      <input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files[0])} />
      <button
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleUpload}
        disabled={!file}
      >
        Upload
      </button>
      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  );
};

export default ProfileEdit;
