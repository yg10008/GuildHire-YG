import React from "react";
import { useAuth } from "../../hooks/useAuth";

const RecentActivity = ({ activities }) => {
  const { login, user, userType } = useAuth();

  return (
    <ul className="space-y-3">
      {activities.length > 0 ? (
        activities.map((activity, idx) => (
          <li
            key={idx}
            className="p-4 rounded-xl bg-gradient-to-r from-white to-gray-50 border border-gray-200 shadow-sm hover:shadow transition duration-300 text-gray-800 text-sm font-medium"
          >
            {activity}
          </li>
        ))
      ) : (
        <li className="text-gray-500 italic text-sm">No recent activity</li>
      )}
    </ul>
  );
};

export default RecentActivity;
