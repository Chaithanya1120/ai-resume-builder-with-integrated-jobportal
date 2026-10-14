import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { seedJobs } from "../configs/seed.js";
import mongoose from "mongoose";
import { fetchLiveRealTimeJobs, checkIsFresherJob, checkIsNonITJob } from "../services/liveJobService.js";

// Global cache for live external jobs so detail requests find them by ID
const liveJobCache = new Map();

const memoryJobs = [
    {
        _id: "66e01a0123456789abcdef01",
        postedBy: { _id: "recruiter_1", name: "Tech Talent Recruiter", email: "recruiter@techcorp.com" },
        title: "Graduate Trainee Software Engineer (Fresher)",
        company: "TechCorp Global",
        companyLogo: "https://logo.clearbit.com/techcorp.com",
        location: "Bangalore",
        type: "Full-time",
        description: "Great opportunity for Freshers! Join our engineering team as a Graduate Trainee Software Engineer.",
        requirements: "0-1 year experience, Bachelor in CS/IT.",
        skills: ["Fresher Friendly", "Software Developer", "React", "Node.js"],
        salaryRange: "₹8,00,000 - ₹12,00,000 / yr",
        source: "Internal",
        isFresher: true,
        status: "open",
        createdAt: new Date().toISOString()
    },
    {
        _id: "66e01a0123456789abcdef02",
        postedBy: { _id: "recruiter_1", name: "Tech Talent Recruiter", email: "recruiter@techcorp.com" },
        title: "Senior Frontend Engineer",
        company: "CloudScale Systems",
        companyLogo: "https://logo.clearbit.com/cloudscale.com",
        location: "Bangalore",
        type: "Full-time",
        description: "Build beautiful, highly interactive web UI components using React, Redux Toolkit, and Tailwind CSS in Bangalore.",
        requirements: "3+ years frontend web engineering, HTML5/CSS3, TypeScript, state management.",
        skills: ["React", "TypeScript", "Tailwind CSS", "Redux"],
        salaryRange: "₹18,00,000 - ₹26,00,000 / yr",
        source: "Internal",
        isFresher: false,
        status: "open",
        createdAt: new Date().toISOString()
    }
];

// controller for creating a job (recruiter only)
// POST: /api/jobs/create
export const createJob = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, company, location, type, description, requirements, skills, salaryRange, isNonIT } = req.body;

        if (!title || !company || !description) {
            return res.status(400).json({ message: "Title, company and description are required" });
        }

        const isFresher = checkIsFresherJob(title, description, requirements || "");
        const nonITFlag = Boolean(isNonIT);

        if (mongoose.connection.readyState === 1) {
            const job = await Job.create({
                postedBy: userId,
                title,
                company,
                location,
                type,
                description,
                requirements,
                skills: Array.isArray(skills) ? skills : (skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : []),
                salaryRange,
                isNonIT: nonITFlag,
                status: "open"
            });
            const obj = job.toObject();
            obj.isFresher = isFresher;
            obj.isNonIT = nonITFlag;
            return res.status(201).json({ message: "Job posted successfully", job: obj });
        }

        const newJob = {
            _id: "job_" + Date.now(),
            postedBy: userId,
            title,
            company,
            location: location || "Remote",
            type: type || "Full-time",
            description,
            requirements: requirements || "",
            skills: Array.isArray(skills) ? skills : (skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : []),
            salaryRange: salaryRange || "",
            source: "Internal",
            isFresher: isFresher,
            isNonIT: nonITFlag,
            status: "open",
            createdAt: new Date().toISOString()
        };
        memoryJobs.unshift(newJob);
        return res.status(201).json({ message: "Job posted successfully", job: newJob });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// controller for listing/searching all open jobs (public)
// GET: /api/jobs?search=&location=&type=&source=&fresher=
export const getAllJobs = async (req, res) => {
    try {
        const { search, location, type, source, fresher } = req.query;
        let dbJobs = [];

        if (mongoose.connection.readyState === 1) {
            try {
                await seedJobs();
                const filter = { status: { $ne: "closed" } };

                if (location && location.trim()) {
                    filter.location = { $regex: location.trim(), $options: "i" };
                }

                if (type && type.trim()) {
                    filter.type = { $regex: type.trim(), $options: "i" };
                }

                if (search && search.trim()) {
                    const cleanSearch = search.trim();
                    const words = cleanSearch.split(/\s+/).filter(Boolean);
                    const wordRegexes = words.map(w => new RegExp(w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'));
                    const fullRegex = new RegExp(cleanSearch.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');

                    filter.$or = [
                        { title: fullRegex },
                        { company: fullRegex },
                        { description: fullRegex },
                        { skills: { $in: wordRegexes } },
                        { title: { $in: wordRegexes } },
                        { description: { $in: wordRegexes } }
                    ];
                }

                dbJobs = await Job.find(filter).sort({ createdAt: -1 });
            } catch (err) {
                console.warn("DB find failed, falling back to memory jobs:", err.message);
            }
        }

        // Attach source tag "Internal" and check isFresher / isNonIT status
        let internalJobs = dbJobs.map(j => {
            const obj = j.toObject ? j.toObject() : j;
            return {
                ...obj,
                source: obj.source || "Internal",
                isExternal: false,
                isFresher: checkIsFresherJob(obj.title, obj.description, obj.requirements),
                isNonIT: obj.isNonIT ?? checkIsNonITJob(obj.title, obj.description, obj.skills || [])
            };
        });

        if (internalJobs.length === 0) {
            internalJobs = memoryJobs.map(j => ({
                ...j,
                source: j.source || "Internal",
                isExternal: false,
                isNonIT: j.isNonIT ?? checkIsNonITJob(j.title, j.description, j.skills || [])
            }));
        }

        // Fetch Live Real-Time Jobs from external aggregators (LinkedIn, Indeed, Naukri, Glassdoor, Google Jobs)
        let externalLiveJobs = [];
        try {
            externalLiveJobs = await fetchLiveRealTimeJobs(search, location, type);
            // Cache live external jobs for detail retrieval
            externalLiveJobs.forEach(job => liveJobCache.set(String(job._id), job));
        } catch (err) {
            console.warn("Failed fetching external live jobs:", err.message);
        }

        // Merge DB internal recruiter jobs + Real-Time External Jobs
        let allJobs = [...internalJobs, ...externalLiveJobs];

        // Give FIRST PREFERENCE to Freshers by default (isFresher: true at top)
        allJobs.sort((a, b) => (b.isFresher ? 1 : 0) - (a.isFresher ? 1 : 0));

        // Filter by fresher pill if explicitly requested
        if (fresher === "true") {
            allJobs = allJobs.filter(j => j.isFresher);
        }

        // Filter by source if requested
        if (source && source.trim() && source.toLowerCase() !== "all") {
            const srcLower = source.trim().toLowerCase();
            allJobs = allJobs.filter(j => (j.source || "").toLowerCase().includes(srcLower));
        }

        return res.status(200).json({ jobs: allJobs });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// controller for getting a single job by id (public)
// GET: /api/jobs/:jobId
export const getJobById = async (req, res) => {
    try {
        const { jobId } = req.params;
        let job = null;

        // First check live external jobs cache
        if (liveJobCache.has(String(jobId))) {
            job = liveJobCache.get(String(jobId));
            return res.status(200).json({ job });
        }

        if (mongoose.connection.readyState === 1) {
            try {
                job = await Job.findById(jobId).populate("postedBy", "name email");
            } catch (err) {
                console.warn("DB findById failed:", err.message);
            }
        }

        if (!job) {
            job = memoryJobs.find(j => String(j._id) === String(jobId));
        }

        if (!job) {
            // Check dynamic external job format
            const fallbackExt = (await fetchLiveRealTimeJobs("", "", "")).find(j => String(j._id) === String(jobId));
            if (fallbackExt) job = fallbackExt;
        }

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        return res.status(200).json({ job });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// controller for getting jobs posted by the logged-in recruiter
// GET: /api/jobs/my/postings
export const getMyPostings = async (req, res) => {
    try {
        const userId = req.userId;
        const jobs = await Job.find({ postedBy: userId }).sort({ createdAt: -1 });

        // attach applicant counts
        const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
            const applicantCount = await Application.countDocuments({ job: job._id });
            return { ...job.toObject(), applicantCount };
        }));

        return res.status(200).json({ jobs: jobsWithCounts });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// controller for updating a job (owner recruiter only)
// PUT: /api/jobs/update
export const updateJob = async (req, res) => {
    try {
        const userId = req.userId;
        const { jobId, ...updates } = req.body;

        const job = await Job.findOne({ _id: jobId, postedBy: userId });
        if (!job) {
            return res.status(404).json({ message: "Job not found or you don't have permission" });
        }

        if (updates.skills && typeof updates.skills === "string") {
            updates.skills = updates.skills.split(",").map(s => s.trim()).filter(Boolean);
        }

        Object.assign(job, updates);
        await job.save();

        return res.status(200).json({ message: "Job updated successfully", job });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// controller for deleting a job (owner recruiter only)
// DELETE: /api/jobs/delete/:jobId
export const deleteJob = async (req, res) => {
    try {
        const userId = req.userId;
        const { jobId } = req.params;

        const job = await Job.findOneAndDelete({ _id: jobId, postedBy: userId });
        if (!job) {
            return res.status(404).json({ message: "Job not found or you don't have permission" });
        }

        await Application.deleteMany({ job: jobId });

        return res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
