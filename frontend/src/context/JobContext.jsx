import React, { createContext, useContext, useState } from "react";

// Create context
export const JobContext = createContext();

// Custom hook to use the context
export const useJob = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error("useJob must be used within a JobProvider");
  }
  return context;
};

// Provider component
export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState({});
  const [loadingJobs, setLoadingJobs] = useState(false);

  const clearJobs = () => {
    setJobs([]);
    setSelectedJob(null);
    setFilters({});
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        setJobs,
        selectedJob,
        setSelectedJob,
        filters,
        setFilters,
        loadingJobs,
        setLoadingJobs,
        clearJobs,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};
