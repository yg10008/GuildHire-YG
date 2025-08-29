import React from "react";
import { Link } from "react-router-dom";

const JobCard = ({ job }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-6 shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
          {job.title}
        </h3>
        <p className="text-gray-600 font-medium">{job.company}</p>
        <p className="text-sm text-gray-500">{job.location}</p>
      </div>
      
      <div className="mt-4">
        <Link
          to={`/jobs/${job._id}`}
          className="inline-block text-sm font-semibold text-blue-600 hover:text-blue-700 transition-all"
        >
          🔍 View Details
        </Link>
      </div>

      {/* Subtle animated gradient highlight */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
    </div>
  );
};

export default JobCard;
