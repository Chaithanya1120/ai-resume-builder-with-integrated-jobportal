import express from "express";
import { getUserById, getUserResumes, loginUser, registerUser, switchUserRole } from "../controllers/userController.js";
import protect from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/data', protect, getUserById);
userRouter.get('/resumes', protect, getUserResumes);
userRouter.put('/switch-role', protect, switchUserRole);

export default userRouter;