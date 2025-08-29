import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job ID is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    status: {
      type: String,
      enum: ["applied", "interviewed", "hired", "rejected"],
      default: "applied",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


applicationSchema.index({ job: 1 });
applicationSchema.index({ user: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ job: 1, user: 1 }, { unique: true }); 


applicationSchema.virtual("resumeScore", {
  ref: "ResumeScore",
  localField: "_id",
  foreignField: "application",
  justOne: true,
});

applicationSchema.set("toObject", { virtuals: true });
applicationSchema.set("toJSON", { virtuals: true });

// Model
const Application = mongoose.models.Application || mongoose.model("Application", applicationSchema);

export default Application;