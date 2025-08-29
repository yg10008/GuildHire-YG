import React, { useState, useEffect } from "react";
import { getProfile, updateResume, getRecruiterProfile } from "../services/userService";
import Loading from "../components/common/Loading";
import ResumeScore from "../components/profile/ResumeScore";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { getMyApplications } from "../services/applicationService";

const Profile = () => {
  const { userType } = useAuth();
  const [user, setUser] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [latestApplicationId, setLatestApplicationId] = useState(null);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = userType === 'recruiter'
          ? await getRecruiterProfile()
          : await getProfile();
        setUser(res);
        // If user, fetch their latest application for resume score
        if (userType === 'user') {
          const apps = await getMyApplications(1, 1); // get first page, 1 result
          if (apps.applications && apps.applications.length > 0) {
            setLatestApplicationId(apps.applications[0]._id);
          }
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userType]);

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    setResumeFile(file);
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const res = await updateResume(formData);
      toast.success("Resume updated successfully!");
      setUser((prev) => ({ ...prev, resume: res.resume }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loading />;

  if (!user) return (
    <div className="text-center p-6">
      <p className="text-red-500">Failed to load profile. Please try again later.</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md border border-gray-100">
      <h2 className="text-3xl font-bold text-indigo-700 mb-8">Profile</h2>

      <div className="space-y-6 text-gray-800">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-lg font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-medium">{user.email}</p>
          </div>
        </div>

        {user.phone && (
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="text-lg font-medium">{user.phone}</p>
          </div>
        )}

        {user.address && (
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="text-lg font-medium">{user.address}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500">Role</p>
          <p className="text-lg font-medium capitalize">{userType}</p>
        </div>

        {/* Resume Upload (User only) */}
        {userType === "user" && (
          <>
            <div>
              <p className="text-sm text-gray-500">Resume</p>
              {user.resume ? (
                <a
                  href={user.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 text-blue-600 hover:underline hover:text-blue-800 transition"
                >
                  View Uploaded Resume
                </a>
              ) : (
                <p className="italic text-gray-400 mt-1">No resume uploaded yet</p>
              )}
            </div>

            {/* Resume Upload Box */}
            <div className="mt-8 p-5 border border-dashed border-indigo-300 bg-indigo-50 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-indigo-700">Upload Resume</h3>
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeChange}
                className="block w-full text-sm text-gray-600
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-100 file:text-indigo-800
                    hover:file:bg-indigo-200 transition"
              />
              <button
                onClick={handleResumeUpload}
                disabled={uploading || !resumeFile}
                className={`mt-4 w-full py-2 px-4 rounded-lg text-white font-semibold transition ${uploading || !resumeFile
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
              >
                {uploading ? "Uploading..." : "Upload Resume"}
              </button>
            </div>

            {/* Resume Score */}
            <div className="mt-8">
              {latestApplicationId ? (
                <ResumeScore applicationId={latestApplicationId} />
              ) : (
                <p className="italic text-gray-500">No applications found to generate resume score.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
