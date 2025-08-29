import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const jobTypes = ["full-time", "part-time", "contract", "internship"];
const roles = ["Software Engineer", "Data Scientist", "Product Manager", "Other"];
const experienceLevels = ["Entry Level", "Mid Level", "Senior Level", "Other"];

const JobForm = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    salary: "",
    jobType: "full-time",
    vacancies: 1,
    status: "active",
    deadline: "",
    skills: "",
    location: "",
    role: "Software Engineer",
    experienceLevel: "Entry Level"
  });

  useEffect(() => {
    if (initialData) {
      // Convert skills array to comma-separated string for the form
      const formattedData = {
        ...initialData,
        skills: Array.isArray(initialData.skills)
          ? initialData.skills.join(", ")
          : initialData.skills,
        deadline: initialData.deadline
          ? new Date(initialData.deadline).toISOString().split('T')[0]
          : ""
      };
      setFormData(formattedData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format the data according to backend requirements
      const jobData = {
        ...formData,
        salary: Number(formData.salary),
        vacancies: Number(formData.vacancies),
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
      };

      await onSubmit(jobData);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to submit job";
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-md border border-gray-100 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-700">{initialData ? "Update Job" : "Post a New Job"}</h2>

      {/* Job Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Job Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          maxLength={100}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          minLength={10}
          rows={4}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
        />
      </div>

      {/* Salary & Vacancies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Salary</label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Vacancies</label>
          <input
            type="number"
            name="vacancies"
            value={formData.vacancies}
            onChange={handleChange}
            required
            min="1"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
          />
        </div>
      </div>

      {/* Job Type & Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Job Type</label>
          <select
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
          >
            {jobTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
          >
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Experience Level</label>
        <select
          name="experienceLevel"
          value={formData.experienceLevel}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
        >
          {experienceLevels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g., New York, Remote"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
        />
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Required Skills (comma-separated)</label>
        <input
          type="text"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="e.g., JavaScript, React, Node.js"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
        />
      </div>

      {/* Deadline */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Application Deadline</label>
        <input
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          min={new Date().toISOString().split("T")[0]}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full rounded-xl py-2 text-white font-semibold transition-all duration-300 ${isLoading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:scale-[1.01] active:scale-95"
            }`}
        >
          {isLoading ? "Submitting..." : initialData ? "Update Job" : "Post Job"}
        </button>
      </div>
    </form>

  );
};

export default JobForm; 