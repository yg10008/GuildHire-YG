import mongoose from "mongoose";

const blacklistTokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "userType", // Dynamic reference based on userType
        },
        userType: {
            type: String,
            required: true,
            enum: ["User", "Recruiter"], // Restrict to valid models
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: "1d", // Token expires after 1 day
        },
    },
    { timestamps: true }
);

const BlacklistToken = mongoose.models.BlacklistToken || mongoose.model("BlacklistToken", blacklistTokenSchema);
export default BlacklistToken;