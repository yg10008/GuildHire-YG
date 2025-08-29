import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import StatsCard from "../components/dashboard/StatsCard";
import RecentActivity from "../components/dashboard/RecentActivity";
import { BarChart3 } from "lucide-react"; // Optional icon for header
import { getMyApplications, getApplicationsByJobId } from "../services/applicationService";
import { getMyJobs } from "../services/jobService";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (user.role === "job_seeker") {
          // Fetch all applications for the user
          const { applications = [] } = await getMyApplications(1, 100);
          setStats({
            Applications: applications.length,
            Shortlisted: applications.filter(app => app.status === "shortlisted").length,
            Interviews: applications.filter(app => app.status === "interviewed").length,
          });
          setActivity(
            applications.slice(0, 5).map(app =>
              `✅ Applied to ${app.job?.title || "a job"}`
            )
          );
        } else if (user.role === "recruiter") {
          // Fetch all jobs posted by the recruiter
          const { jobs = [] } = await getMyJobs(1, 100);
          // Fetch all applications for all jobs posted by this recruiter
          let totalApplicants = 0;
          let interviewsScheduled = 0;
          let recentActivities = [];
          for (const job of jobs) {
            const { applications = [] } = await getApplicationsByJobId(job._id, 1, 100);
            totalApplicants += applications.length;
            interviewsScheduled += applications.filter(app => app.status === "interviewed").length;
            if (applications.length > 0) {
              recentActivities.push(`📩 Received ${applications.length} application(s) for '${job.title}'`);
            }
          }
          setStats({
            "Jobs Posted": jobs.length,
            "Total Applicants": totalApplicants,
            "Interviews Scheduled": interviewsScheduled,
          });
          setActivity([
            ...jobs.slice(0, 2).map(job => `📢 Posted '${job.title}' role`),
            ...recentActivities.slice(0, 3),
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };

    fetchDashboard();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
      {/* Dashboard Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Dashboard</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Object.entries(stats).map(([label, value]) => (
          <StatsCard key={label} label={label} value={value} />
        ))}
      </div>

      {/* Activity Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 border-gray-200">
          🔔 Recent Activity
        </h3>
        <RecentActivity activities={activity} />
      </div>
    </div>
  );
};

export default Dashboard;
