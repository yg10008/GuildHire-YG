import React, { useState } from "react";
import { forgotPassword } from "../services/authService";
import { Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await forgotPassword({ email });
      setSuccess(res.message || "Password reset link sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 px-6 py-8 bg-white/90 border border-gray-100 rounded-2xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">🔐 Forgot Password</h2>

      {success && (
        <div className="flex items-start gap-3 p-4 border border-green-200 bg-green-50 rounded-2xl shadow-sm">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-green-800 text-sm font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 border border-red-200 bg-red-50 rounded-2xl shadow-sm">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="flex items-center gap-2 text-sm font-bold text-gray-700"
          >
            <Mail className="w-4 h-4 text-indigo-600" />
            Registered Email Address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            className="w-full bg-gradient-to-r from-gray-50 to-indigo-50/30 border-2 border-gray-200/80 rounded-2xl px-5 py-3 text-gray-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all duration-300 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/30 shadow-sm hover:shadow-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 px-6 py-3 text-white font-bold rounded-2xl transition-all duration-300 ${
            loading
              ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              📩 Send Reset Link
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
