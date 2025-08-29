import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getApplicationsByJobId, getMyApplications, updateApplicationStatus } from "../services/applicationService";
import { createChat } from "../services/chatService";
import Loading from "../components/common/Loading";
import { useAuth } from "../hooks/useAuth";

const ViewApplications = () => {
  const { id: jobId } = useParams(); // jobId will be undefined for user view
  const { userType, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Don't fetch data until we know the user type
    if (authLoading) return;

    // Redirect if accessing recruiter route as user or vice versa
    if (jobId && userType !== 'recruiter') {
      navigate('/applications');
      return;
    }

    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError("");
        let data;
        if (userType === 'recruiter') {
          if (jobId) {
            data = await getApplicationsByJobId(jobId, page);
          } else {
            // Fetch all applications for all jobs posted by this recruiter
            data = await getApplicationsByJobId(null, page);
          }
        } else {
          data = await getMyApplications(page);
        }
        setApplications(data.applications || []);
        setTotalPages(data.pages || 1);
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Failed to load applications";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [jobId, page, userType, authLoading, navigate]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      // Refresh the applications list
      const data = await getApplicationsByJobId(jobId, page);
      setApplications(data.applications || []);
      toast.success("Application status updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleCreateChat = async (app) => {
    // Try to get recruiter ID from the populated job object
    const recruiterId = app.job?.recruiterId?._id || app.job?.recruiterId;
    const userId = app.user?._id || app.user;

    console.log("Creating chat with:", { 
      app, 
      recruiterId, 
      userId,
      job: app.job,
      recruiterData: app.job?.recruiterId 
    });

    if (!userId || !recruiterId) {
      console.error("Missing user or recruiter info for chat creation", { 
        app, 
        userId, 
        recruiterId,
        job: app.job 
      });
      toast.error("Cannot create chat: missing user or recruiter info. Please contact support or try again later.");
      return;
    }

    try {
      const participants = [
        { user: userId, model: "User" },
        { user: recruiterId, model: "Recruiter" },
      ];
      
      console.log("Creating chat with participants:", participants);
      
      const res = await createChat(participants);
      toast.success("Chat created successfully!");
      
      // Navigate to chat page
      navigate('/chat');
    } catch (err) {
      console.error("Chat creation error:", err);
      toast.error(
        err.response?.data?.message || "Failed to create chat or chat already exists."
      );
    }
  };

  if (authLoading || loading) return <Loading />;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">
        {userType === 'recruiter' ? 'Job Applications' : 'Your Applications'}
      </h2>

      {error && (
        <p className="text-red-600 text-center mb-4 bg-red-50 px-4 py-2 rounded-md">
          {error}
        </p>
      )}

      {applications.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-lg mx-auto border border-gray-100">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {userType === 'recruiter' 
                ? 'No Applications Received Yet'
                : 'No Job Applications Yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {userType === 'recruiter' 
                ? "You haven't received any applications for this job posting yet. Share your job listing to attract potential candidates."
                : "You haven't applied to any jobs yet. Start exploring available positions and submit your applications."}
            </p>
            <button
              onClick={() => navigate(userType === 'recruiter' ? '/recruiter/jobs' : '/jobs')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {userType === 'recruiter' 
                ? '← Back to My Jobs'
                : 'Browse Available Jobs →'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {applications.map((app) => (
            <div key={app._id} className="bg-white shadow rounded-lg p-5 border border-gray-100">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-indigo-700">{app.job?.title}</h3>
                  <p className="text-gray-600 text-sm">{app.job?.company}</p>

                  {userType === 'recruiter' && (
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span className="font-medium text-gray-700">Applicant:</span> {app.user?.name}</p>
                      <p><span className="font-medium text-gray-700">Email:</span> {app.user?.email}</p>
                    </div>
                  )}
                  {/* Chat button for both recruiter and user */}
                  <button
                    className="mt-3 px-4 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-sm font-medium shadow"
                    onClick={() => handleCreateChat(app)}
                  >
                    Create Chat
                  </button>
                </div>
                

                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                  ${app.status === 'hired' && 'bg-green-100 text-green-700'}
                  ${app.status === 'rejected' && 'bg-red-100 text-red-700'}
                  ${app.status === 'interviewed' && 'bg-blue-100 text-blue-700'}
                  ${app.status === 'applied' && 'bg-gray-100 text-gray-700'}
                `}>
                    {app.status}
                  </span>

                  {userType === 'recruiter' && (
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                      className="border border-gray-300 rounded-md text-sm px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="applied">Applied</option>
                      <option value="interviewed">Interviewed</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${page === 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${page === totalPages
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewApplications;
