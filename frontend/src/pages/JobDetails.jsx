import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import jobService from "../services/jobService";
import { applyToJob } from "../services/applicationService";
import { createResumeScore } from "../services/resumeService";
import Loading from "../components/common/Loading";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await jobService.getJobById(id);
        setJob(response.job);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching job details");
        toast.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    try {
      setApplying(true);
      const res = await applyToJob(id);
      toast.success("Application submitted successfully!");
      if (res.application && res.application._id) {
        try {
          await createResumeScore(res.application._id);
          toast.success("Resume score generated!");
        } catch {
          toast.error("Failed to generate resume score.");
        }
      }
      navigate("/applications");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to submit application";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="p-6 text-red-600 text-center">{error}</div>;
  if (!job) return <div className="p-6 text-center text-gray-600">Job not found</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-indigo-700">{job.title}</h2>
          <div className="text-gray-600 mt-1">{job.company}</div>
          <div className="text-sm text-gray-500">{job.location}</div>
          {job.salary && (
            <div className="mt-2 text-sm text-green-600 font-semibold">
              💰 Salary: {job.salary} LPA
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-1">📋 Job Description</h3>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {job.description}
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-1">✅ Requirements</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {job.requirements?.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>

        <div className="pt-4">
          <button
            onClick={handleApply}
            disabled={applying}
            className={`w-full md:w-auto px-6 py-3 rounded-xl text-white font-bold transition-all duration-300 ${
              applying
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:scale-[1.02] active:scale-95"
            }`}
          >
            {applying ? "Submitting..." : "Apply Now 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
