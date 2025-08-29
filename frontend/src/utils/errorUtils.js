// Utility to test API connectivity
export const testApiConnection = async (apiUrl) => {
    try {
        const response = await fetch(`${apiUrl}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });
        
        return {
            success: response.ok,
            status: response.status,
            message: response.ok ? 'Connected' : `Error ${response.status}`
        };
    } catch (error) {
        return {
            success: false,
            status: 0,
            message: error.message || 'Connection failed'
        };
    }
};

// Rate limiting detection utility
export const isRateLimited = (error) => {
    return error.response?.status === 429 || 
           error.message?.toLowerCase().includes('too many requests') ||
           error.message?.toLowerCase().includes('rate limit');
};

// Server error detection utility
export const isServerError = (error) => {
    return error.response?.status >= 500 ||
           error.message?.toLowerCase().includes('server error') ||
           error.message?.toLowerCase().includes('internal server error');
};

// Network error detection utility
export const isNetworkError = (error) => {
    return error.code === 'NETWORK_ERROR' ||
           error.code === 'ECONNABORTED' ||
           error.message?.toLowerCase().includes('network') ||
           error.message?.toLowerCase().includes('fetch') ||
           error.message?.toLowerCase().includes('timeout');
};

// Exponential backoff calculator
export const calculateBackoffDelay = (retryCount, baseDelay = 1000, maxDelay = 10000) => {
    return Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
};

// Format error message for user display
export const formatErrorMessage = (error) => {
    if (isRateLimited(error)) {
        return "Too many requests. Please wait a moment and try again.";
    } else if (isNetworkError(error)) {
        return "Unable to connect to the server. Please check your internet connection.";
    } else if (isServerError(error)) {
        return "The server is temporarily unavailable. Please try again later.";
    } else if (error.response?.data?.message) {
        return error.response.data.message;
    } else {
        return error.message || "An unexpected error occurred. Please try again.";
    }
};
