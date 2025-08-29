// src/context/AuthContext.jsx
import React, { useEffect, useState } from "react";
import { getProfile, getRecruiterProfile } from "../services/userService";
import { login as loginApi, recruiterLogin } from "../services/authService";
import { AuthContext } from "./AuthContext.js";


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userType, setUserType] = useState(localStorage.getItem("userType") || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const login = async (credentials, type = "user") => {
        try {
            let res;
            if (type === "recruiter") {
                res = await recruiterLogin(credentials);
                if (res.token && res.recruiter) {
                    localStorage.setItem("userType", "recruiter");
                    localStorage.setItem("token", res.token);
                    localStorage.setItem("recruiterId", res.recruiter.id)
                    setUserType("recruiter");
                    setUser(res.recruiter);
                    setError(null);
                } else {
                    throw new Error(res.message || "Recruiter login failed: Missing recruiter data");
                }
            } else {
                res = await loginApi(credentials);
                console.log('User login response:', res);
                if (res.token && res.user) {
                    localStorage.setItem("userType", "user");
                    localStorage.setItem("token", res.token);
                    localStorage.setItem("userId", res.user.id)
                    setUserType("user");
                    setUser(res.user);
                    setError(null);
                } else {
                    throw new Error(res.message || "User login failed: Missing user data");
                }
            }
            // Only set localStorage 'user' if res.user exists
            if (res.user && res.user.id) {
                localStorage.setItem("user", res.user.id);
            }
            return res;
        } catch (error) {
            console.log('Login error:', error);
            localStorage.removeItem("token");
            localStorage.removeItem("userType");
            setUser(null);
            setUserType(null);
            setError(error.response?.data?.message || error.message || "Login failed. Please try again.");
            throw error;
        }
    };

    const logout = () => {
        // Clear authentication data
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        localStorage.removeItem("userId");
        localStorage.removeItem("recruiterId");
        localStorage.removeItem("user");
        
        setUser(null);
        setUserType(null);
        setError(null);
        
        // Chat cleanup will be handled by the ChatContext when it detects no token
    };

    const fetchProfile = async () => {
        const token = localStorage.getItem("token");
        const storedUserType = localStorage.getItem("userType");

        if (!token || !storedUserType) {
            setUser(null);
            setUserType(null);
            setLoading(false);
            setError(null);
            return;
        }

        try {
            let res;
            if (storedUserType === "recruiter") {
                res = await getRecruiterProfile();
                setUser(res.recruiter);
                setUserType("recruiter");
            } else {
                res = await getProfile();
                setUser(res.user);
                setUserType("user");
            }
            setError(null);
        } catch (error) {
            console.error("Error fetching profile:", error);
            // If there's an error (like invalid token), clear everything
            localStorage.removeItem("token");
            localStorage.removeItem("userType");
            setUser(null);
            setUserType(null);
            setError(error.response?.data?.message || "Failed to load profile. Please try again later.");

            // If it's a network error, set a more specific message
            if (error.message === "Network Error") {
                setError("Unable to connect to the server. Please check your internet connection.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            await fetchProfile();
        };
        init();
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            userType,
            loading,
            error,
            login,
            logout,
            fetchProfile,
            isAuthenticated: !!user && !!localStorage.getItem("token")
        }}>
            {children}
        </AuthContext.Provider>
    );
};

