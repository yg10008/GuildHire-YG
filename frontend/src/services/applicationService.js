import api from "./api";

const applyToJob = async (jobData) => {
  const res = await api.post("/applications", { job: jobData });
  return res.data;
};

const getApplicationsByJobId = async (jobId, page = 1, limit = 10) => {
  const res = await api.get(`/applications`, {
    params: {
      jobId,
      page,
      limit
    }
  });
  return res.data;
};

const getMyApplications = async (page = 1, limit = 10) => {
  const userType = localStorage.getItem("userType");
  if (userType === "recruiter") {
    return getApplicationsByJobId(null, page, limit);
  }
  // For job seekers, use the new endpoint
  const res = await api.get(`/applications/my`, {
    params: { page, limit }
  });
  return res.data;
};

const getApplicationById = async (applicationId) => {
  const res = await api.get(`/applications/${applicationId}`);
  return res.data;
};

const updateApplicationStatus = async (applicationId, status) => {
  const res = await api.put(`/applications/${applicationId}/status`, { status });
  return res.data;
};

const deleteApplication = async (applicationId) => {
  const res = await api.delete(`/applications/${applicationId}`);
  return res.data;
};

export {
  applyToJob,
  getApplicationsByJobId,
  getMyApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication
};
