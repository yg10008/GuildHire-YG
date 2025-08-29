import React from 'react';
import { CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react';

const ProgressStep = ({ step, currentStep, label, description }) => {
    const isActive = step === currentStep;
    const isCompleted = step < currentStep;
    const isPending = step > currentStep;

    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
            isActive ? 'bg-blue-50 border border-blue-200' : 
            isCompleted ? 'bg-green-50 border border-green-200' : 
            'bg-gray-50 border border-gray-200'
        }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isActive ? 'bg-blue-500' : 
                isCompleted ? 'bg-green-500' : 
                'bg-gray-300'
            }`}>
                {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                    <Clock className="w-3 h-3 text-white" />
                )}
            </div>
            <div className="flex-1">
                <p className={`text-sm font-medium ${
                    isActive ? 'text-blue-800' : 
                    isCompleted ? 'text-green-800' : 
                    'text-gray-600'
                }`}>
                    {label}
                </p>
                {description && (
                    <p className={`text-xs ${
                        isActive ? 'text-blue-600' : 
                        isCompleted ? 'text-green-600' : 
                        'text-gray-500'
                    }`}>
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};

const RegistrationProgress = ({ currentStep, error }) => {
    const steps = [
        { label: 'Validating Information', description: 'Checking form data' },
        { label: 'Uploading Resume', description: 'Processing file upload' },
        { label: 'Creating Account', description: 'Setting up your profile' },
        { label: 'Sending Verification', description: 'Email confirmation' }
    ];

    if (error) {
        return (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <div>
                    <p className="text-sm font-medium text-red-800">Registration Failed</p>
                    <p className="text-xs text-red-600">Please try again</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {steps.map((step, index) => (
                <ProgressStep
                    key={index}
                    step={index + 1}
                    currentStep={currentStep}
                    label={step.label}
                    description={step.description}
                />
            ))}
        </div>
    );
};

export default RegistrationProgress;
