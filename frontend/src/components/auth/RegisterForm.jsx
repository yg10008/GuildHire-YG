import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useOnlineStatus } from "../../hooks/useNetworkStatus";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { register, recruiterRegister } from "../../services/authService";
import ErrorBanner from "../common/ErrorBanner";
import { ConnectionStatus } from "../common/LoadingComponents";
import {
    Mail, Lock, User, Phone, MapPin, Building2, FileText, Users, Loader2, AlertCircle
} from 'lucide-react';

const RegisterForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const isOnline = useOnlineStatus();
    const [form, setForm] = useState({
        role: "user",
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        companyName: "",
    });
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setResume(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        // Check online status first
        if (!isOnline) {
            setError("No internet connection. Please check your network and try again.");
            return;
        }
        
        setLoading(true);
        
        console.log('Form submission started:', {
            role: form.role,
            hasResume: !!resume
        });
        
        try {
            let response;
            if (form.role === "user") {
                // Job Seeker: send FormData with resume
                const formData = new FormData();
                formData.append("name", form.name);
                formData.append("email", form.email);
                formData.append("password", form.password);
                formData.append("phone", form.phone);
                formData.append("address", form.address);
                if (resume) formData.append("resume", resume);
                
                console.log('Sending user registration request...');
                response = await register(formData);
            } else {
                // Recruiter: send JSON
                console.log('Sending recruiter registration request...');
                const recruiterData = {
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    phone: form.phone,
                    address: form.address,
                    companyName: form.companyName,
                };
                response = await recruiterRegister(recruiterData);
            }
            
            console.log('Registration successful:', response);
            setSuccess(response.message || "Registration successful! Please check your email to verify your account.");
            setForm({
                role: "user",
                name: "",
                email: "",
                password: "",
                phone: "",
                address: "",
                companyName: "",
            });
            setResume(null);
        } catch (err) {
            console.error("Registration error:", err);
            
            // Handle different types of errors
            if (err.response) {
                // Server responded with error status
                const status = err.response.status;
                const message = err.response.data?.message || err.response.statusText;
                
                if (status === 429) {
                    setError("Too many requests. Please wait a moment and try again.");
                } else if (status === 400) {
                    setError(message || "Invalid information provided. Please check your details.");
                } else if (status === 409) {
                    setError(message || "An account with this email already exists.");
                } else if (status >= 500) {
                    setError("Server is temporarily unavailable. Please try again later.");
                } else {
                    setError(message || "Registration failed. Please try again.");
                }
            } else if (err.code === 'NETWORK_ERROR' || err.message.toLowerCase().includes('network')) {
                setError("Network error. Please check your internet connection and try again.");
            } else if (err.code === 'ECONNABORTED' || err.message.toLowerCase().includes('timeout')) {
                setError("Request timed out. The server might be busy. Please try again in a moment.");
            } else {
                setError(err.message || "Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        setError("");
        // Re-submit the form
        document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Banner */}
            <ErrorBanner error={error} onRetry={handleRetry} />
            {success && (
                <div className="relative overflow-hidden">
                    <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/60 rounded-2xl shadow-sm backdrop-blur-sm">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-green-800 text-sm font-medium leading-relaxed">{success}</p>
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/10 to-emerald-400/10 animate-pulse"></div>
                </div>
            )}

            {/* Role */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                        <Users className="w-3 h-3 text-white" />
                    </div>
                    I am a:
                </label>
                <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full appearance-none bg-gradient-to-r from-gray-50 to-blue-50/30 border-2 border-gray-200/80 rounded-2xl px-5 py-3 pr-12 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                    <option value="user">🔍 Job Seeker</option>
                    <option value="recruiter">🏢 Recruiter</option>
                </select>
            </div>

            {/* Input Fields */}
            {[
                { name: "name", label: "Full Name", icon: User, type: "text", autoComplete: "name" },
                { name: "email", label: "Email", icon: Mail, type: "email", autoComplete: "email" },
                { name: "password", label: "Password", icon: Lock, type: "password", autoComplete: "new-password" },
                { name: "phone", label: "Phone Number", icon: Phone, type: "text", autoComplete: "tel" },
                { name: "address", label: "Address", icon: MapPin, type: "text", autoComplete: "street-address" },
            ].map(({ name, label, icon: IconComponent, ...rest }) => (
                <div key={name} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                        <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md flex items-center justify-center">
                            <IconComponent className="w-3 h-3 text-white" />
                        </div>
                        {label}
                    </label>
                    <input
                        {...rest}
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                        placeholder={label}
                        required
                        className="w-full bg-gradient-to-r from-gray-50 to-emerald-50/30 border-2 border-gray-200/80 rounded-2xl px-5 py-3 text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                </div>
            ))}


            {/* Company Name (Recruiter only) */}
            {form.role === "recruiter" && (
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                        <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-md flex items-center justify-center">
                            <Building2 className="w-3 h-3 text-white" />
                        </div>
                        Company Name
                    </label>
                    <input
                        name="companyName"
                        type="text"
                        value={form.companyName}
                        onChange={handleChange}
                        placeholder="Company Name"
                        required
                        className="w-full bg-gradient-to-r from-gray-50 to-indigo-50/30 border-2 border-gray-200/80 rounded-2xl px-5 py-3 text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                </div>
            )}

            {/* Resume Upload (User only) */}
            {form.role === "user" && (
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                        <div className="w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-md flex items-center justify-center">
                            <FileText className="w-3 h-3 text-white" />
                        </div>
                        Resume (PDF)
                    </label>
                    <input
                        type="file"
                        name="resume"
                        accept=".pdf"
                        onChange={handleFileChange}
                        required
                        className="w-full file:px-4 file:py-2 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200 transition-all duration-300"
                    />
                </div>
            )}

            {/* Connection Status */}
            <div className="flex justify-center">
                <ConnectionStatus isOnline={isOnline} isConnecting={loading} />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading || !isOnline}
                className={`
          relative w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 transform shadow-lg hover:shadow-xl
          ${loading || !isOnline
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed scale-[0.98]'
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2'}
        `}
            >
                {!loading && isOnline && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20 animate-pulse"></div>
                )}
                <div className="relative flex items-center gap-2">
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Registering...</span>
                        </>
                    ) : !isOnline ? (
                        <>
                            <span>⚠️ No Internet Connection</span>
                        </>
                    ) : (
                        <>
                            <span>🚀 Register</span>
                            <div className="w-2 h-2 bg-white/80 rounded-full group-hover:animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-white/60 rounded-full group-hover:animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </>
                    )}
                </div>
            </button>
        </form>
    );
};

export default RegisterForm;
