import api from "./api";

export const register = async (formData) => {
    const res = await api.post("/users/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const recruiterRegister = async (formData) => {
    const res = await api.post("/recruiters/register", formData);
    return res.data;
};

export const login = async (data) => {
    const res = await api.post("/users/login", data);
    return res.data;
};

export const recruiterLogin = async (data) => {
    const res = await api.post("/recruiters/login", data);
    return res.data;
};

export const forgotPassword = async (data) => {
    const res = await api.post("/users/forgot-password", data);
    return res.data;
};

export const resetPassword = async (token, data) => {
    const res = await api.post(`/users/reset-password/${token}`, data);
    return res.data;
};
