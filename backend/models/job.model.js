import mongoose from "mongoose";


const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [100, "Job title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      default: "full-time",
    },
    vacancies: {
      type: Number,
      required: [true, "Number of vacancies is required"],
      min: [1, "Vacancies must be at least 1"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "closed"],
      default: "active",
    },
    deadline: {
      type: Date,
      required: [true, "Application deadline is required"],
      validate: {
        validator: (date) => date > new Date(),
        message: "Deadline must be in the future",
      },
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: [true, "Recruiter ID is required"],
    },
    skills: {
      type: [String],
      required: [true, "Skills are required"],
      validate: {
        validator: (arr) => arr.length > 0 && arr.every(skill => skill.trim().length > 0 && skill.length <= 50),
        message: "At least one skill is required, and each skill must be between 1 and 50 characters",
      },
    },
    location: {
      type: String,
      trim: true,
      required: [true, "Work location is required (e.g., city, state, 'Remote')"],
    },
    role: {
      type: String,
      enum: ["Software Engineer", "Data Scientist", "Product Manager", "Other"],
      required: [true, "Job role/category is required"],
    },
    experienceLevel: {
      type: String,
      enum: ["Entry Level", "Mid Level", "Senior Level", "Other"],
      required: [true, "Experience level is required"],
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
jobSchema.index({ recruiterId: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ role: 1 });

jobSchema.virtual("applications", {
  ref: "Application",
  localField: "_id",
  foreignField: "jobId",
});

jobSchema.set("toObject", { virtuals: true });
jobSchema.set("toJSON", { virtuals: true });

// Model
const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);

export default Job;