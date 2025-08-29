import mongoose from "mongoose";

const ResumeScoreSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: [true, "Application ID is required"],
    },
    score: {
      type: Number,
      required: [true, "Score is required"],
      min: [0, "Score cannot be negative"],
      max: [100, "Score cannot exceed 100"],
    },
    details: {
      type: String,
      required: [true, "Details are required"],
      trim: true,
      maxlength: [1000, "Details cannot exceed 1000 characters"],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "Details must not be empty",
      },
    },
  },
  { timestamps: true }
);


ResumeScoreSchema.index({ application: 1 }, { unique: true });

ResumeScoreSchema.pre('save', async function (next) {
  try {
    const ApplicationModel = mongoose.model("Application");
    const application = await ApplicationModel.findById(this.application);
    if (!application) {
      throw new Error('Referenced application does not exist');
    }
    next();
  } catch (error) {
    next(error);
  }
});

ResumeScoreSchema.virtual("scoreCategory").get(function () {
  if (this.score >= 80) return "Excellent";
  if (this.score >= 60) return "Good";
  if (this.score >= 40) return "Average";
  return "Poor";
});


ResumeScoreSchema.set("toObject", { virtuals: true });
ResumeScoreSchema.set("toJSON", { virtuals: true });


const ResumeScore = mongoose.models.ResumeScore || mongoose.model("ResumeScore", ResumeScoreSchema);

export default ResumeScore;