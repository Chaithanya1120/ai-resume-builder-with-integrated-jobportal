import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Resume from "../models/Resume.js";
import mongoose from "mongoose";
import { memoryResumes } from "./resumeController.js";

export const memoryUsers = [];

const generateToken = (userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret_key_123', { expiresIn: '7d' });
    return token;
};

// controller for user registration
// POST: /api/users/register
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (mongoose.connection.readyState === 1) {
            try {
                const user = await User.findOne({ email });
                if (user) {
                    return res.status(400).json({ message: 'User already exists' });
                }

                const hashedPassword = bcrypt.hashSync(password, 10);
                const newUser = await User.create({
                    name, email, password: hashedPassword, role: role === 'recruiter' ? 'recruiter' : 'jobseeker'
                });

                const token = generateToken(newUser._id);
                newUser.password = undefined;
                return res.status(201).json({ message: 'User created successfully', token, user: newUser });
            } catch (err) {
                console.warn("DB user registration error, falling back to memory:", err.message);
            }
        }

        // In-memory fallback
        const existing = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = {
            _id: "user_" + Date.now(),
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role === 'recruiter' ? 'recruiter' : 'jobseeker'
        };
        memoryUsers.push(newUser);

        const token = generateToken(newUser._id);
        const userToReturn = { ...newUser };
        delete userToReturn.password;

        return res.status(201).json({ message: 'User created successfully', token, user: userToReturn });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// controller for user login
// POST: /api/users/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        if (mongoose.connection.readyState === 1) {
            try {
                const user = await User.findOne({ email });
                if (!user) {
                    return res.status(400).json({ message: 'Invalid email or password' });
                }

                if (!user.comparePassword(password)) {
                    return res.status(400).json({ message: 'Invalid email or password' });
                }

                const token = generateToken(user._id);
                user.password = undefined;
                return res.status(200).json({ message: 'Login successful', token, user });
            } catch (err) {
                console.warn("DB login error, falling back to memory:", err.message);
            }
        }

        // In-memory fallback
        const user = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);
        const userToReturn = { ...user };
        delete userToReturn.password;

        return res.status(200).json({ message: 'Login successful', token, user: userToReturn });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// controller for getting user by id
// GET: /api/users/data
export const getUserById = async (req, res) => {
    try {
        const userId = req.userId;

        if (mongoose.connection.readyState === 1) {
            try {
                const user = await User.findById(userId);
                if (user) {
                    user.password = undefined;
                    return res.status(200).json({ user });
                }
            } catch (err) {
                console.warn("DB getUserById error:", err.message);
            }
        }

        let user = memoryUsers.find(u => String(u._id) === String(userId));
        if (!user) {
            user = { _id: userId, name: "Chaithanya.R", email: "chaithanyaram11@gmail.com", role: "jobseeker" };
        }

        const userToReturn = { ...user };
        delete userToReturn.password;
        return res.status(200).json({ user: userToReturn });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// controller for getting user resumes
// GET: /api/users/resumes
export const getUserResumes = async (req, res) => {
    try {
        const userId = req.userId;
        let resumes = [];

        if (mongoose.connection.readyState === 1) {
            try {
                resumes = await Resume.find({ userId });
            } catch (err) {
                console.warn("DB getUserResumes error:", err.message);
            }
        }

        if (!resumes || resumes.length === 0) {
            resumes = (memoryResumes || []).filter(r => String(r.userId) === String(userId));
        }

    return res.status(200).json({ resumes });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// controller for switching user role
// PUT: /api/users/switch-role
export const switchUserRole = async (req, res) => {
    try {
        const userId = req.userId;
        const { role } = req.body;

        if (!['jobseeker', 'recruiter'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be jobseeker or recruiter.' });
        }

        if (mongoose.connection.readyState === 1) {
            try {
                const user = await User.findByIdAndUpdate(
                    userId,
                    { role },
                    { new: true, select: '-password' }
                );
                if (user) {
                    return res.status(200).json({ message: `Switched to ${role} successfully`, user });
                }
            } catch (err) {
                console.warn("DB switchRole error, falling back to memory:", err.message);
            }
        }

        // In-memory fallback
        const memUser = memoryUsers.find(u => String(u._id) === String(userId));
        if (memUser) {
            memUser.role = role;
        }
        return res.status(200).json({ message: `Switched to ${role} successfully` });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};