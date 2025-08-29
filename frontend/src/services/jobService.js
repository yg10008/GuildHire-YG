import api from "./api";

export const getAllJobs = async (page = 1, limit = 10, recruiterId) => {
    const res = await api.get("/jobs", {
        params: { page, limit, recruiterId }
    });
    return res.data;
};

export const getJobById = async (id) => {
    const res = await api.get(`/jobs/${id}`);
    return res.data;
};

export const createJob = async (jobData) => {
    try {
        // Validate required fields
        const requiredFields = ['title', 'description', 'salary', 'jobType', 'vacancies', 'deadline', 'skills', 'location', 'role', 'experienceLevel'];
        const missingFields = requiredFields.filter(field => !jobData[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Ensure skills is an array
        if (typeof jobData.skills === 'string') {
            jobData.skills = jobData.skills.split(',').map(skill => skill.trim()).filter(Boolean);
        }

        // Ensure numeric fields are numbers
        jobData.salary = Number(jobData.salary);
        jobData.vacancies = Number(jobData.vacancies);

        // Ensure deadline is a valid date
        if (!(new Date(jobData.deadline) > new Date())) {
            throw new Error('Deadline must be in the future');
        }

        const res = await api.post("/jobs", jobData);
        return res.data;
    } catch (error) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw error;
    }
};

export const updateJob = async (id, jobData) => {
    const res = await api.put(`/jobs/${id}`, jobData);
    return res.data;
};

export const deleteJob = async (id) => {
    const res = await api.delete(`/jobs/${id}`);
    return res.data;
};

export const getMyJobs = async (page = 1, limit = 10) => {
    const res = await api.get("/jobs", {
        params: { 
            page, 
            limit,
            _id: localStorage.getItem('recruiterId')
        }
    });
    return res.data;
};

export const searchJobs = async (query, page = 1, limit = 10) => {
    const res = await api.get("/jobs/search", {
        params: { query, page, limit }
    });
    return res.data;
};

const jobService = {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
    getMyJobs,
    searchJobs
};

export default jobService;

