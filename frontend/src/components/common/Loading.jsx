import React from "react";

const Loading = ({ size = "base", message = "Loading..." }) => {
  const sizeClasses = {
    small: "h-4 w-4 border-2",
    base: "h-6 w-6 border-4",
    large: "h-10 w-10 border-[5px]",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-6 text-gray-600">
      <div className="relative">
        <div
          className={`
            ${sizeClasses[size]} 
            animate-spin rounded-full 
            border-t-transparent 
            border-r-blue-500 border-b-indigo-500 border-l-purple-500 
            shadow-md
          `}
        ></div>
        {/* Optional inner glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-sm animate-pulse"></div>
      </div>
      <span className="text-sm font-medium text-gray-700 tracking-wide">{message}</span>
    </div>
  );
};

export default Loading;
