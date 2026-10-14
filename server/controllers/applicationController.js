import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Resume from "../models/Resume.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { sendApplicationEmail } from "../services/emailService.js";

export const memoryApplications = [];

// controller for applying to a job (jobseeker)
// POST: /api/applications/apply
export const applyToJob = async (req, res) => {
    try {
        const userId = req.userId;
        const { jobId, resumeId, coverLetter } = req.body;

        if (!jobId || !resumeId) {
            return res.status(400).json({ message: "jobId and resumeId are required" });
        }

        let userEmail = "jobseeker@example.com";
        let userName = "Candidate";

        if (mongoose.connection.readyState === 1) {
            try {
                const userDoc = await User.findById(userId);
                if (userDoc) {
                    userEmail = userDoc.email;
                    userName = userDoc.name || "Candidate";
                }

                const job = await Job.findById(jobId);
                if (!job || job.status !== "open") {
                    return res.status(404).json({ message: "Job not found or no longer accepting applications" });
                }

                const resume = await Resume.findOne({ _id: resumeId, userId });
                if (!resume) {
                    return res.status(404).json({ message: "Resume not found" });
                }

                const existing = await Application.findOne({ job: jobId, applicant: userId });
                if (existing) {
                    return res.status(400).json({ message: "You have already applied to this job" });
                }

                if (!resume.public) {
                    resume.public = true;
                    await resume.save();
                }

                const application = await Application.create({
                    job: jobId,
                    applicant: userId,
                    resume: resumeId,
                    coverLetter,
                });

                // Dispatch confirmation email
                await sendApplicationEmail({
                    applicantEmail: userEmail,
                    applicantName: userName,
                    jobTitle: job.title,
                    company: job.company,
                    source: job.source || "Internal Portal",
                    resumeTitle: resume.title || "AI Generated Resume"
                });

                return res.status(201).json({ message: "Application submitted successfully! Confirmation email sent.", application });
            } catch (err) {
                console.warn("DB applyToJob error, falling back to memory:", err.message);
            }
        }

        // In-memory fallback
        const existing = memoryApplications.find(a => String(a.job) === String(jobId) && String(a.applicant) === String(userId));
        if (existing) {
            return res.status(400).json({ message: "You have already applied to this job" });
        }

        const newApp = {
            _id: "app_" + Date.now(),
            job: jobId,
            applicant: userId,
            resume: resumeId,
            coverLetter: coverLetter || "",
            status: "pending",
            createdAt: new Date().toISOString()
        };
        memoryApplications.push(newApp);

        // Dispatch confirmation email in-memory
        await sendApplicationEmail({
            applicantEmail: userEmail,
            applicantName: userName,
            jobTitle: "Software Opening",
            company: "Tech Company",
            source: "Job Portal",
            resumeTitle: "Resume"
        });

        return res.status(201).json({ message: "Application submitted successfully! Confirmation email sent.", application: newApp });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "You have already applied to this job" });
        }
        return res.status(400).json({ message: error.message });
    }
};

// controller for getting the logged-in user's applications
// GET: /api/applications/my
export const getMyApplications = async (req, res) => {
    try {
        const userId = req.userId;
        let applications = [];

        if (mongoose.connection.readyState === 1) {
            try {
                applications = await Application.find({ applicant: userId })
                    .populate("job")
                    .populate("resume", "title template")
                    .sort({ createdAt: -1 });
            } catch (err) {
                console.warn("DB getMyApplications error:", err.message);
            }
        }

        if (!applications || applications.length === 0) {
            applications = memoryApplications.filter(a => String(a.applicant) === String(userId));
        }

        return res.status(200).json({ applications });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// controller for a recruiter viewing applicants for one of their jobs
// GET: /api/applications/job/:jobId
export const getApplicantsForJob = async (req, res) => {
    try {
        const userId = req.userId;
        const { jobId } = req.params;
        let applications = [];
        let job = null;

        if (mongoose.connection.readyState === 1) {
            try {
                job = await Job.findOne({ _id: jobId, postedBy: userId });
                if (job) {
                    applications = await Application.find({ job: jobId })
                        .populate("applicant", "name email")
                        .populate("resume", "title template")
                        .sort({ createdAt: -1 });
                    return res.status(200).json({ job, applications });
                }
            } catch (err) {
                console.warn("DB getApplicantsForJob error:", err.message);
            }
        }

        applications = memoryApplications.filter(a => String(a.job) === String(jobId));
        return res.status(200).json({ job: { _id: jobId, title: "Job Posting" }, applications });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// controller for a recruiter updating an application's status
// PUT: /api/applications/status
export const updateApplicationStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const { applicationId, status } = req.body;

        if (mongoose.connection.readyState === 1) {
            try {
                const application = await Application.findById(applicationId).populate("job");
                if (application) {
                    if (String(application.job.postedBy) !== String(userId)) {
                        return res.status(403).json({ message: "You don't have permission to update this application" });
                    }
                    application.status = status;
                    await application.save();
                    return res.status(200).json({ message: "Application status updated", application });
                }
            } catch (err) {
                console.warn("DB updateApplicationStatus error:", err.message);
            }
        }

        const appIndex = memoryApplications.findIndex(a => String(a._id) === String(applicationId));
        if (appIndex !== -1) {
            memoryApplications[appIndex].status = status;
            return res.status(200).json({ message: "Application status updated", application: memoryApplications[appIndex] });
        }

        return res.status(404).json({ message: "Application not found" });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
