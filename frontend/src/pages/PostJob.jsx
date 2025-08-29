import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJob } from "../services/jobService";
import JobForm from "../components/jobs/JobForm";
import { toast } from "react-toastify";

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (jobData) => {
    try {
      setLoading(true);
      await createJob(jobData);
      toast.success("Job posted successfully!");
      navigate("/recruiter/jobs");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post job");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Post a New Job</h2>
      <JobForm
        onSubmit={handleSubmit}
        isLoading={loading}
      />
    </div>
  );
};

export default PostJob;
