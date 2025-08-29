import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getMyJobs, deleteJob } from "../services/jobService";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../components/common/Loading";
import { toast } from "react-toastify";

const RecruiterJobs = () => {
    const { userType } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await getMyJobs(page);
            setJobs(data.jobs || []);
            setTotalPages(data.pages || 1);
            setError("");
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to load jobs.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [page]);

    const handleDeleteJob = async (jobId) => {
        if (window.confirm("Are you sure you want to delete this job?")) {
            try {
                await deleteJob(jobId);
                toast.success("Job deleted successfully");
                fetchJobs(); // Refresh the list
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to delete job");
            }
        }
    };

    const handleCreateJob = () => {
        navigate("/recruiter/jobs/new");
    };

    if (loading) return <Loading />;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-indigo-700">Your Posted Jobs</h2>
                <button
                    onClick={handleCreateJob}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg transition"
                >
                    + Post New Job
                </button>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {jobs.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg shadow-inner">
                    <p className="text-gray-600 text-lg mb-4">You haven't posted any jobs yet.</p>
                    <button
                        onClick={handleCreateJob}
                        className="text-indigo-600 hover:text-indigo-800 font-medium underline"
                    >
                        Create your first job posting
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {jobs.map((job) => (
                        <div
                            key={job._id}
                            className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 border border-gray-100"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-800">{job.title}</h3>
                                    <p className="text-gray-600 mt-1">{job.description.slice(0, 150)}...</p>
                                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                                        <span>📍 {job.location}</span>
                                        {job.salary && <span>💰 {job.salary}</span>}
                                    </div>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${job.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : job.status === 'closed'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    {job.status}
                                </span>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-4">
                                <Link
                                    to={`/jobs/${job._id}`}
                                    className="text-indigo-600 hover:text-indigo-800 font-medium transition"
                                >
                                    View
                                </Link>
                                <Link
                                    to={`/recruiter/jobs/${job._id}/edit`}
                                    className="text-yellow-600 hover:text-yellow-800 font-medium transition"
                                >
                                    Edit
                                </Link>
                                <Link
                                    to={`/recruiter/jobs/${job._id}/applications`}
                                    className="text-emerald-600 hover:text-emerald-800 font-medium transition"
                                >
                                    Applications
                                </Link>
                                <button
                                    onClick={() => handleDeleteJob(job._id)}
                                    className="text-red-600 hover:text-red-800 font-medium transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-4">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={`px-4 py-2 rounded-lg font-medium transition ${page === 1
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                            }`}
                    >
                        Previous
                    </button>
                    <span className="text-gray-600 font-medium">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className={`px-4 py-2 rounded-lg font-medium transition ${page === totalPages
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                            }`}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );

};

export default RecruiterJobs;
