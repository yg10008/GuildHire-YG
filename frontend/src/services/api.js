import axios from "axios";

// Utility function for exponential backoff delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second
const MAX_DELAY = 10000; // 10 seconds

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 30000, // 30 second timeout
});

// Retry function with exponential backoff
const retryRequest = async (config, retryCount = 0) => {
    try {
        return await axios(config);
    } catch (error) {
        const shouldRetry = 
            retryCount < MAX_RETRIES && 
            (error.code === 'NETWORK_ERROR' || 
             error.code === 'ECONNABORTED' ||
             error.response?.status === 429 || // Rate limited
             error.response?.status >= 500); // Server errors

        if (shouldRetry) {
            const delayMs = Math.min(INITIAL_DELAY * Math.pow(2, retryCount), MAX_DELAY);
            console.log(`Request failed, retrying in ${delayMs}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            
            await delay(delayMs);
            return retryRequest(config, retryCount + 1);
        }
        
        throw error;
    }
};

// Attach token to all requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers["X-User-Type"] = userType || "user";
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Handle response errors with retry logic
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Rate limiting handling
        if (error.response?.status === 429 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // Get retry-after header if available, otherwise use exponential backoff
            const retryAfter = error.response.headers['retry-after'];
            const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : INITIAL_DELAY;
            
            console.log(`Rate limited, retrying after ${delayMs}ms...`);
            await delay(delayMs);
            
            return retryRequest(originalRequest);
        }

        // Network/timeout errors with retry
        if ((error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED' || error.response?.status >= 500) 
            && !originalRequest._retry) {
            originalRequest._retry = true;
            return retryRequest(originalRequest);
        }

        // Handle 401 errors (authentication)
        if (error.response?.status === 401) {
            const isAuthError = error.response?.data?.message?.toLowerCase().includes('token') ||
                error.response?.data?.message?.toLowerCase().includes('unauthorized');

            if (isAuthError && !window.location.pathname.includes('/login')) {
                localStorage.removeItem("token");
                localStorage.removeItem("userType");
                const currentPath = window.location.pathname;
                window.location.href = `/login?returnUrl=${encodeURIComponent(currentPath)}`;
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
