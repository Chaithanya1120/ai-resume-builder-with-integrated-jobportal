import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { seedJobs } from "./seed.js";
import dns from "node:dns";

try {
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {
    console.warn("Could not override DNS servers:", e.message);
}

let mongod = null;

const connectDB = async (retries = 3, delay = 1000) => {
    let mongodbURI = process.env.MONGODB_URI;
    const projectName = 'resume-builder';

    if (mongodbURI) {
        let fullUri = mongodbURI;
        if (!fullUri.includes('/' + projectName)) {
            if (fullUri.includes('?')) {
                const parts = fullUri.split('?');
                const base = parts[0].endsWith('/') ? parts[0] : parts[0] + '/';
                fullUri = `${base}${projectName}?${parts[1]}`;
            } else {
                const base = fullUri.endsWith('/') ? fullUri : fullUri + '/';
                fullUri = `${base}${projectName}`;
            }
        }

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                await mongoose.connect(fullUri, { serverSelectionTimeoutMS: 5000 });
                console.log("Database connected successfully to MongoDB Atlas/URI:", fullUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
                await seedJobs();
                return;
            } catch (error) {
                console.warn(`Database connection attempt ${attempt} failed:`, error.message);
                if (attempt < retries) {
                    await new Promise(res => setTimeout(res, delay));
                }
            }
        }
    }

    console.log("Atlas DB connection offline. Initializing local in-memory database...");
    try {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);
        console.log("Database connected successfully to MongoMemoryServer (In-Memory)");
        await seedJobs();
    } catch (memErr) {
        console.error("Failed to start in-memory database:", memErr.message);
    }
};

export default connectDB;