import { useState, useEffect } from 'react';

const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
};

const useApiStatus = (apiUrl) => {
    const [isApiOnline, setIsApiOnline] = useState(true);
    const [isChecking, setIsChecking] = useState(false);

    const checkApiStatus = async () => {
        setIsChecking(true);
        try {
            const response = await fetch(`${apiUrl}/health`, {
                method: 'GET',
                timeout: 5000,
            });
            setIsApiOnline(response.ok);
        } catch (error) {
            setIsApiOnline(false);
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        checkApiStatus();
        const interval = setInterval(checkApiStatus, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, [apiUrl]);

    return { isApiOnline, isChecking, checkApiStatus };
};

export { useOnlineStatus, useApiStatus };
