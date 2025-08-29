import React from 'react';
import { Loader2, Clock, Wifi } from 'lucide-react';

const LoadingButton = ({ loading, children, type = "button", className = "", disabled = false, ...props }) => {
    return (
        <button
            type={type}
            disabled={loading || disabled}
            className={`
                relative inline-flex items-center justify-center gap-2 px-6 py-3 
                bg-gradient-to-r from-blue-600 to-indigo-600 
                hover:from-blue-700 hover:to-indigo-700 
                text-white font-semibold rounded-2xl 
                focus:outline-none focus:ring-2 focus:ring-blue-500/40 
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300 shadow-lg hover:shadow-xl
                ${className}
            `}
            {...props}
        >
            {loading && (
                <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {children}
        </button>
    );
};

const ConnectionStatus = ({ isOnline = true, isConnecting = false }) => {
    if (isConnecting) {
        return (
            <div className="flex items-center gap-2 text-yellow-600 text-sm">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Connecting to server...</span>
            </div>
        );
    }

    if (!isOnline) {
        return (
            <div className="flex items-center gap-2 text-red-600 text-sm">
                <Wifi className="w-4 h-4" />
                <span>Connection lost</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-green-600 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Connected</span>
        </div>
    );
};

export { LoadingButton, ConnectionStatus };
