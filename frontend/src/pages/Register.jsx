import React from "react";
import RegisterForm from "../components/auth/RegisterForm";

const Register = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-xl p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-center mb-6">Create an Account</h2>
                <RegisterForm />
            </div>
        </div>
    );
};

export default Register;
