import React from "react";
import LoginForm from "../components/auth/LoginForm";

const Login = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-center mb-6">Login to Your Account</h2>
                <LoginForm />
            </div>
        </div>
    );
};

export default Login;