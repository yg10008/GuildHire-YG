import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getJobById, updateJob } from "../services/jobService";
import JobForm from "../components/jobs/JobForm";
import Loading from "../components/common/Loading";
import { toast } from "react-toastify";

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await getJobById(id);
        setJob(response.job);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch job details");
        navigate("/recruiter/jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, navigate]);

  const handleSubmit = async (jobData) => {
    try {
      setSubmitting(true);
      await updateJob(id, jobData);
      toast.success("Job updated successfully!");
      navigate("/recruiter/jobs");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update job");
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Edit Job</h2>
      <JobForm
        initialData={job}
        onSubmit={handleSubmit}
        isLoading={submitting}
      />
    </div>
  );
};

export default EditJob;
