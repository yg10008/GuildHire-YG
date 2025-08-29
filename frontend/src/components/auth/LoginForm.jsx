import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Users, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

const LoginForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: "", password: "" });
    const [userType, setUserType] = useState("user");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Get return URL from query parameters
    const searchParams = new URLSearchParams(location.search);
    const returnUrl = searchParams.get('returnUrl') || '/dashboard';

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await login(form, userType);
            toast.success("Login successful!");
            navigate(returnUrl);
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
            toast.error("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Enhanced Error Message */}
            {error && (
                <div className="relative overflow-hidden">
                    <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/60 rounded-2xl shadow-sm backdrop-blur-sm">
                        <div className="flex-shrink-0 mt-0.5">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-red-800 text-sm font-medium leading-relaxed">{error}</p>
                        </div>
                    </div>
                    {/* Subtle animated border */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-400/20 to-pink-400/20 animate-pulse"></div>
                </div>
            )}

            {/* Enhanced User Type Selection */}
            <div className="space-y-3">
                <label
                    htmlFor="userType"
                    className="flex items-center gap-2 text-sm font-bold text-gray-800"
                >
                    <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                        <Users className="w-3 h-3 text-white" />
                    </div>
                    I am a:
                </label>
                <div className="relative group">
                    <select
                        id="userType"
                        name="userType"
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        className="w-full appearance-none bg-gradient-to-r from-gray-50 to-blue-50/30 border-2 border-gray-200/80 rounded-2xl px-5 py-4 pr-12 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all duration-300 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 cursor-pointer shadow-sm hover:shadow-md"
                        aria-describedby="userType-description"
                    >
                        <option className="text-gray-700" value="user">🔍 Job Seeker</option>
                        <option className="text-gray-700" value="recruiter">🏢 Recruiter</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none group-hover:scale-105 transition-transform duration-200">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
                <p id="userType-description" className="text-xs text-gray-600 font-medium ml-1">
                    ✨ Choose your account type to personalize your experience
                </p>
            </div>

            {/* Enhanced Email Field */}
            <div className="space-y-3">
                <label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-bold text-gray-800"
                >
                    <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md flex items-center justify-center">
                        <Mail className="w-3 h-3 text-white" />
                    </div>
                    Email address
                </label>
                <div className="relative group">
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full bg-gradient-to-r from-gray-50 to-emerald-50/30 border-2 border-gray-200/80 rounded-2xl px-5 py-4 text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition-all duration-300 hover:border-emerald-300 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/30 shadow-sm hover:shadow-md"
                        placeholder="✉️ Enter your email address"
                        required
                        autoComplete="email"
                    />
                    {/* Focus ring effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/10 to-teal-400/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
            </div>

            {/* Enhanced Password Field */}
            <div className="space-y-3">
                <label
                    htmlFor="password"
                    className="flex items-center gap-2 text-sm font-bold text-gray-800"
                >
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-violet-500 rounded-md flex items-center justify-center">
                        <Lock className="w-3 h-3 text-white" />
                    </div>
                    Password
                </label>
                <div className="relative group">
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full bg-gradient-to-r from-gray-50 to-purple-50/30 border-2 border-gray-200/80 rounded-2xl px-5 py-4 pr-14 text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 transition-all duration-300 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-violet-50/30 shadow-sm hover:shadow-md"
                        placeholder="🔒 Enter your password"
                        required
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-purple-600 focus:outline-none focus:text-purple-600 transition-all duration-200 group"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 flex items-center justify-center hover:bg-purple-50 hover:border-purple-200 hover:scale-105 transition-all duration-200 shadow-sm">
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </div>
                    </button>
                    {/* Focus ring effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/10 to-violet-400/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
            </div>

            {/* Enhanced Submit Button */}
            <button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className={`
                    relative w-full overflow-hidden flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 transform group shadow-lg hover:shadow-xl
                    ${loading
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed scale-[0.98] shadow-sm'
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2'
                    }
                `}
            >
                {/* Animated background for non-loading state */}
                {!loading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-purple-400/20 animate-pulse"></div>
                )}

                <div className="relative flex items-center justify-center gap-3">
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-base">Signing in...</span>
                        </>
                    ) : (
                        <>
                            <span className="text-base">✨ Sign in</span>
                            <div className="w-2 h-2 bg-white/80 rounded-full group-hover:animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-white/60 rounded-full group-hover:animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-white/40 rounded-full group-hover:animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                        </>
                    )}
                </div>
            </button>

            {/* Enhanced Footer Links */}
            <div className="pt-6 border-t border-gradient-to-r from-gray-200 via-blue-200 to-purple-200">
                <div className="flex items-center justify-between text-sm">
                    <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200 focus:outline-none focus:underline hover:gap-3"
                    >
                        <span>🔄 Forgot password?</span>
                        <div className="w-1 h-1 bg-blue-600 rounded-full group-hover:w-2 group-hover:h-2 transition-all duration-200"></div>
                    </button>
                    <div className="flex items-center gap-2 text-gray-600">
                        <span>New here?</span>
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200 focus:outline-none focus:underline hover:gap-3"
                        >
                            <span>🚀 Sign up</span>
                            <div className="w-1 h-1 bg-blue-600 rounded-full group-hover:w-2 group-hover:h-2 transition-all duration-200"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;