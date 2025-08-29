import api from "./api";

export const getProfile = async () => {
    const res = await api.get("/users/profile");
    return res.data;
};

export const updateResume = async (formData) => {
    const res = await api.put("/users/update-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const getRecruiterProfile = async () => {
    const res = await api.get("/recruiters/profile");
    return res.data;
};
