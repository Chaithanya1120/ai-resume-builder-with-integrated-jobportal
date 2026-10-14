import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true },
    coverLetter: { type: String, default: "" },
    status: {
        type: String,
        enum: ["applied", "reviewed", "shortlisted", "rejected", "accepted"],
        default: "applied",
    },
}, { timestamps: true });

// A user can only apply once per job
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Application = mongoose.model("Application", ApplicationSchema);

export default Application;
