import imagekit from "../configs/imageKit.js";
import Resume from "../models/Resume.js";
import fs from 'fs';
import mongoose from "mongoose";

export const memoryResumes = [];

// controller for creating a new resume
// POST: /api/resumes/create
export const createResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { title } = req.body;

        if (mongoose.connection.readyState === 1) {
            try {
                const newResume = await Resume.create({ userId, title: title || 'Untitled Resume' });
                const resumeObj = newResume.toObject ? newResume.toObject() : newResume;
                memoryResumes.push(resumeObj);
                return res.status(201).json({ message: 'Resume created successfully', resume: newResume });
            } catch (err) {
                console.warn("DB createResume error, falling back to memory:", err.message);
            }
        }

        const newResume = {
            _id: "resume_" + Date.now(),
            userId,
            title: title || "Untitled Resume",
            template: "classic",
            personal_info: { full_name: "", email: "", phone: "", location: "", profession: "", summary: "", image: "" },
            work_experience: [],
            education: [],
            project: [],
            skills: [],
            public: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        memoryResumes.push(newResume);
        return res.status(201).json({ message: 'Resume created successfully', resume: newResume });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// controller for deleting a resume
// DELETE: /api/resumes/delete
export const deleteResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        if (mongoose.connection.readyState === 1) {
            try {
                await Resume.findOneAndDelete({ _id: resumeId });
            } catch (err) {
                console.warn("DB deleteResume error:", err.message);
            }
        }

        const index = memoryResumes.findIndex(r => String(r._id) === String(resumeId));
        if (index !== -1) {
            memoryResumes.splice(index, 1);
        }

        return res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// get user resume by id
// GET: /api/resumes/get
export const getResumeById = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;
        let resume = null;

        if (mongoose.connection.readyState === 1) {
            try {
                resume = await Resume.findOne({ _id: resumeId });
            } catch (err) {
                console.warn("DB getResumeById error:", err.message);
            }
        }

        if (!resume) {
            resume = memoryResumes.find(r => String(r._id) === String(resumeId));
        }

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        return res.status(200).json({ resume });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// get resume by id public
// GET: /api/resumes/public
export const getPublicResumeById = async (req, res) => {
    try {
        const { resumeId } = req.params;
        let resume = null;

        if (mongoose.connection.readyState === 1) {
            try {
                resume = await Resume.findOne({ public: true, _id: resumeId });
                if (!resume) {
                    resume = await Resume.findOne({ _id: resumeId });
                }
            } catch (err) {
                console.warn("DB getPublicResumeById error:", err.message);
            }
        }

        if (!resume) {
            resume = memoryResumes.find(r => String(r._id) === String(resumeId));
        }

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        return res.status(200).json({ resume });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// controller for updating a resume
// PUT: /api/resumes/update
export const updateResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId, resumeData, removeBackground } = req.body;
        const image = req.file;

        let resumeDataCopy;
        if (typeof resumeData === 'string') {
            resumeDataCopy = await JSON.parse(resumeData);
        } else {
            resumeDataCopy = structuredClone(resumeData);
        }

        if (image) {
            try {
                const response = await imagekit.files.upload({
                    file: image.buffer,
                    fileName: 'resume.png',
                    folder: 'user-resumes',
                    transformation: {
                        pre: 'w-300,h-300,fo-face,z-0.75' + (removeBackground ? ',e-bgremove' : '')
                    }
                });
                if (resumeDataCopy && resumeDataCopy.personal_info) {
                    resumeDataCopy.personal_info.image = response.url;
                }
            } catch (err) {
                console.warn("ImageKit upload error, saving image buffer directly:", err.message);
                if (resumeDataCopy && resumeDataCopy.personal_info && !resumeDataCopy.personal_info.image) {
                    const base64Img = `data:${image.mimetype || 'image/png'};base64,${image.buffer.toString('base64')}`;
                    resumeDataCopy.personal_info.image = base64Img;
                }
            }
        }

        if (mongoose.connection.readyState === 1) {
            try {
                const resume = await Resume.findOneAndUpdate(
                    { _id: resumeId },
                    { $set: resumeDataCopy },
                    { new: true, runValidators: false }
                );
                if (resume) {
                    const resumeObj = resume.toObject ? resume.toObject() : resume;
                    const existingIdx = memoryResumes.findIndex(r => String(r._id) === String(resumeId));
                    if (existingIdx !== -1) memoryResumes[existingIdx] = resumeObj;
                    else memoryResumes.push(resumeObj);
                    return res.status(200).json({ message: 'Saved successfully', resume });
                }
            } catch (err) {
                console.warn("DB updateResume error:", err.message);
            }
        }

        let existingIndex = memoryResumes.findIndex(r => String(r._id) === String(resumeId));
        if (existingIndex !== -1) {
            memoryResumes[existingIndex] = { ...memoryResumes[existingIndex], ...resumeDataCopy, updatedAt: new Date().toISOString() };
            return res.status(200).json({ message: 'Saved successfully', resume: memoryResumes[existingIndex] });
        }

        const fallbackResume = { _id: resumeId, userId, ...resumeDataCopy, updatedAt: new Date().toISOString() };
        memoryResumes.push(fallbackResume);
        return res.status(200).json({ message: 'Saved successfully', resume: fallbackResume });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};