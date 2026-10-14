import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: "Remote" },
    type: {
        type: String,
        enum: ["Full-time", "Part-time", "Internship", "Contract", "Remote"],
        default: "Full-time",
    },
    description: { type: String, required: true },
    requirements: { type: String, default: "" },
    skills: [{ type: String }],
    salaryRange: { type: String, default: "" },
    isNonIT: { type: Boolean, default: false },
    status: { type: String, enum: ["open", "closed"], default: "open" },
}, { timestamps: true });

const Job = mongoose.model("Job", JobSchema);

export default Job;
