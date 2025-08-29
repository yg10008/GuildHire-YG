import api from "./api"
export const getResumeScore = async (applicationId) => {
    const res = await api.get(`/resume-scores/${applicationId}`);
    return res.data;
};

export const createResumeScore = async (applicationId) => {
    const res = await api.post('/resume-scores', { applicationId });
    return res.data;
};
