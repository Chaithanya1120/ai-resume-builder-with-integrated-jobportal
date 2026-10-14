import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
    applyToJob,
    getMyApplications,
    getApplicantsForJob,
    updateApplicationStatus,
} from "../controllers/applicationController.js";

const applicationRouter = express.Router();

applicationRouter.post("/apply", protect, applyToJob);
applicationRouter.get("/my", protect, getMyApplications);
applicationRouter.get("/job/:jobId", protect, getApplicantsForJob);
applicationRouter.put("/status", protect, updateApplicationStatus);

export default applicationRouter;
