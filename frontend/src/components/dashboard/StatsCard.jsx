import React from "react";
import { TrendingUp } from "lucide-react";

const StatsCard = ({ label, value }) => {
  return (
    <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-gray-200 shadow hover:shadow-md transition duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{label}</h4>
          <p className="text-3xl font-bold text-indigo-700 mt-1">{value}</p>
        </div>
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
        </div>
      </div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-300/10 to-sky-300/10 pointer-events-none"></div>
    </div>
  );
};

export default StatsCard;
