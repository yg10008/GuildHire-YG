import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Loading from "../common/Loading";

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, userType, loading, error } = useAuth();
    const location = useLocation();

    // While checking auth state
    if (loading) return <Loading size="large" message="Authenticating..." />;

    // If there's an error loading the profile
    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If not logged in
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

    // If role restriction exists and user is not authorized
    if (requiredRole) {
        const currentRole = userType === "recruiter" ? "recruiter" : "user";
        if (currentRole !== requiredRole) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // If email is not verified (optional)
    // Note: Both user and recruiter objects should have isVerified field
    if (user.isVerified === false) {
        return <Navigate to="/verify-email" replace />;
    }

    return children;
};

export default ProtectedRoute;
