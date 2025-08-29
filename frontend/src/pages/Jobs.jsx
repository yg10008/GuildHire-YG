import React, { useEffect, useState } from "react";
import jobService from "../services/jobService";
import JobCard from "../components/jobs/JobCard";
import Loading from "../components/common/Loading";
import { toast } from "react-toastify";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = async (pageNum = page) => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobService.getAllJobs(pageNum);
      if (pageNum === 1) {
        setJobs(response.jobs || []);
      } else {
        setJobs((prev) => [...prev, ...(response.jobs || [])]);
      }
      setHasMore((response.jobs || []).length === 10);
    } catch (err) {
      setError(err.message || "Failed to fetch jobs");
      toast.error(err.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      fetchJobs(page + 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">✨ Available Jobs</h2>

      {error && !jobs.length && (
        <div className="text-center text-red-600 border border-red-100 bg-red-50 rounded-xl p-6 shadow">
          <p>{error}</p>
          <button
            onClick={() => fetchJobs(1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Try Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>

      {loading && (
        <div className="mt-6 text-center">
          <Loading message="Fetching jobs..." />
        </div>
      )}

      {!loading && jobs.length === 0 && (
        <div className="text-center text-gray-600 py-10">
          <p>No jobs found. Try refreshing later.</p>
        </div>
      )}

      {!loading && hasMore && jobs.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            className="inline-flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            🔽 Load More Jobs
          </button>
        </div>
      )}
    </div>
  );
};

export default Jobs;
