import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
    createJob,
    getAllJobs,
    getJobById,
    getMyPostings,
    updateJob,
    deleteJob,
} from "../controllers/jobController.js";

const jobRouter = express.Router();

jobRouter.post("/create", protect, createJob);
jobRouter.get("/my/postings", protect, getMyPostings);
jobRouter.get("/", getAllJobs);
jobRouter.get("/:jobId", getJobById);
jobRouter.put("/update", protect, updateJob);
jobRouter.delete("/delete/:jobId", protect, deleteJob);

export default jobRouter;
