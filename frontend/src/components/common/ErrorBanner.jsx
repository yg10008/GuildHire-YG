import React from 'react';
import { AlertCircle, Wifi, Clock, RefreshCw } from 'lucide-react';

const ErrorBanner = ({ error, onRetry }) => {
    const getErrorDetails = (errorMessage) => {
        const message = errorMessage?.toLowerCase() || '';
        
        if (message.includes('too many requests') || message.includes('rate limit')) {
            return {
                icon: Clock,
                title: 'Rate Limited',
                description: 'Too many requests. Please wait a moment before trying again.',
                color: 'orange',
                showRetry: true
            };
        } else if (message.includes('network') || message.includes('fetch')) {
            return {
                icon: Wifi,
                title: 'Connection Error',
                description: 'Unable to connect to the server. Please check your internet connection.',
                color: 'red',
                showRetry: true
            };
        } else if (message.includes('timeout')) {
            return {
                icon: Clock,
                title: 'Request Timeout',
                description: 'The request took too long. The server might be busy.',
                color: 'yellow',
                showRetry: true
            };
        } else if (message.includes('server') || message.includes('500')) {
            return {
                icon: AlertCircle,
                title: 'Server Error',
                description: 'The server is temporarily unavailable. Please try again later.',
                color: 'red',
                showRetry: true
            };
        } else {
            return {
                icon: AlertCircle,
                title: 'Error',
                description: errorMessage,
                color: 'red',
                showRetry: false
            };
        }
    };

    if (!error) return null;

    const { icon: IconComponent, title, description, color, showRetry } = getErrorDetails(error);

    const colorClasses = {
        red: {
            bg: 'from-red-50 to-pink-50',
            border: 'border-red-200/60',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            textColor: 'text-red-800',
            pulseColor: 'from-red-400/10 to-pink-400/10'
        },
        orange: {
            bg: 'from-orange-50 to-amber-50',
            border: 'border-orange-200/60',
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            textColor: 'text-orange-800',
            pulseColor: 'from-orange-400/10 to-amber-400/10'
        },
        yellow: {
            bg: 'from-yellow-50 to-amber-50',
            border: 'border-yellow-200/60',
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            textColor: 'text-yellow-800',
            pulseColor: 'from-yellow-400/10 to-amber-400/10'
        }
    };

    const classes = colorClasses[color];

    return (
        <div className="relative overflow-hidden">
            <div className={`flex items-start gap-3 p-4 bg-gradient-to-r ${classes.bg} border ${classes.border} rounded-2xl shadow-sm backdrop-blur-sm`}>
                <div className={`w-8 h-8 ${classes.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={`w-4 h-4 ${classes.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`${classes.textColor} text-sm font-semibold leading-relaxed`}>{title}</p>
                    <p className={`${classes.textColor} text-sm leading-relaxed opacity-90`}>{description}</p>
                </div>
                {showRetry && onRetry && (
                    <button
                        onClick={onRetry}
                        className={`flex items-center gap-2 px-3 py-1.5 ${classes.iconBg} ${classes.textColor} text-sm font-medium rounded-lg hover:opacity-80 transition-opacity`}
                    >
                        <RefreshCw className="w-3 h-3" />
                        Retry
                    </button>
                )}
            </div>
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${classes.pulseColor} animate-pulse`}></div>
        </div>
    );
};

export default ErrorBanner;
