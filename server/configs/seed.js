import Job from "../models/Job.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const seedJobs = async () => {
    try {
        const count = await Job.countDocuments();
        if (count > 0) return;

        let recruiter = await User.findOne({ role: "recruiter" });
        if (!recruiter) {
            const hashedPassword = await bcrypt.hash("recruiter123", 10);
            recruiter = await User.create({
                name: "Tech Talent Recruiter",
                email: "recruiter@techcorp.com",
                password: hashedPassword,
                role: "recruiter"
            });
        }

        const sampleJobs = [
            // --- IT Jobs ---
            {
                postedBy: recruiter._id,
                title: "Software Developer",
                company: "TechCorp Global",
                location: "Bangalore",
                type: "Full-time",
                description: "Looking for an enthusiastic Software Developer proficient in React, Node.js, and modern full-stack web architectures to join our core engineering team in Bangalore.",
                requirements: "Bachelor degree in CS or equivalent, 1-3 years of full stack web development experience.",
                skills: ["Software Developer", "React", "Node.js", "JavaScript", "MongoDB"],
                salaryRange: "₹12,00,000 - ₹18,00,000 / yr",
                status: "open"
            },
            {
                postedBy: recruiter._id,
                title: "Senior Frontend Engineer",
                company: "CloudScale Systems",
                location: "Bangalore",
                type: "Full-time",
                description: "Build beautiful, highly interactive web UI components using React, Redux Toolkit, and Tailwind CSS.",
                requirements: "3+ years frontend web engineering, HTML5/CSS3, TypeScript, state management.",
                skills: ["React", "TypeScript", "Tailwind CSS", "Redux"],
                salaryRange: "₹18,00,000 - ₹26,00,000 / yr",
                status: "open"
            },
            {
                postedBy: recruiter._id,
                title: "Backend API Engineer",
                company: "DataPulse AI",
                location: "Bangalore",
                type: "Full-time",
                description: "Design high performance Node.js REST APIs, database schemas, and microservices for enterprise applications.",
                requirements: "Node.js, Express, MongoDB, PostgreSQL, Redis experience.",
                skills: ["Node.js", "Express", "MongoDB", "REST APIs"],
                salaryRange: "₹15,00,000 - ₹22,00,000 / yr",
                status: "open"
            },
            {
                postedBy: recruiter._id,
                title: "Full Stack Web Developer",
                company: "Innovate Labs",
                location: "Remote",
                type: "Remote",
                description: "Develop scalable cloud products across frontend user interfaces and serverless backends.",
                requirements: "End-to-end web feature development skills with React and Node.js.",
                skills: ["React", "Node.js", "Python", "Docker"],
                salaryRange: "₹14,00,000 - ₹21,00,000 / yr",
                status: "open"
            },
            {
                postedBy: recruiter._id,
                title: "Python AI / ML Developer",
                company: "Cognitive AI Systems",
                location: "Bangalore",
                type: "Full-time",
                description: "Build GenAI integrations, machine learning models, and Python backend microservices in Bangalore.",
                requirements: "Python, FastAPI, PyTorch, OpenAI/HuggingFace API experience.",
                skills: ["Python", "FastAPI", "AI", "Machine Learning"],
                salaryRange: "₹20,00,000 - ₹32,00,000 / yr",
                status: "open"
            },
            // --- Non-IT Jobs ---
            {
                postedBy: recruiter._id,
                title: "Relationship Manager – Retail Banking",
                company: "HDFC Bank",
                location: "Mumbai",
                type: "Full-time",
                description: "Manage customer portfolios, cross-sell banking products, and drive branch targets. Ideal for candidates with strong communication and finance acumen.",
                requirements: "Graduate in any stream. 1-3 years banking/finance experience preferred. Strong interpersonal skills.",
                skills: ["Relationship Management", "Banking", "Sales", "Customer Acquisition", "KYC"],
                salaryRange: "₹4,00,000 - ₹8,00,000 / yr",
                status: "open"
            },
            {
                postedBy: recruiter._id,
                title: "Digital Marketing Executive (Fresher)",
                company: "Swiggy",
                location: "Bangalore",
                type: "Full-time",
                description: "Execute digital campaigns on Meta Ads, Google Ads, and Email Marketing. Analyze performance metrics and optimize ROI.",
                requirements: "Freshers welcome. BBA/MBA Marketing or any graduate with digital marketing certification preferred.",
                skills: ["Google Ads", "Meta Ads", "SEO", "Email Marketing", "Analytics"],
                salaryRange: "₹3,00,000 - ₹5,50,000 / yr",
                status: "open"
            },
            {
                postedBy: recruiter._id,
                title: "HR Executive – Talent Acquisition",
                company: "Wipro BPS",
                location: "Hyderabad",
                type: "Full-time",
                description: "Source, screen, and onboard candidates across non-tech functions. Manage bulk hiring drives and maintain HRMS data.",
                requirements: "MBA HR or equivalent. 0-2 years experience in recruitment.",
                skills: ["Talent Acquisition", "HR", "Naukri Portal", "Bulk Hiring", "Excel"],
                salaryRange: "₹2,50,000 - ₹5,00,000 / yr",
                status: "open"
            },
            {
                postedBy: recruiter._id,
                title: "Secondary School Teacher – Mathematics",
                company: "Delhi Public School",
                location: "Delhi",
                type: "Full-time",
                description: "Deliver engaging Maths lessons for Classes 9-12 (CBSE). Design lesson plans, conduct assessments, and guide students in board exam preparation.",
                requirements: "B.Ed + B.Sc/M.Sc Mathematics. CTET/STET qualified preferred. Freshers may apply.",
                skills: ["Teaching", "Mathematics", "CBSE Curriculum", "Lesson Planning", "Student Assessment"],
                salaryRange: "₹3,00,000 - ₹6,00,000 / yr",
                status: "open"
            },
            {
                postedBy: recruiter._id,
                title: "Logistics & Supply Chain Executive",
                company: "Blue Dart Express",
                location: "Chennai",
                type: "Full-time",
                description: "Coordinate inbound and outbound shipments, manage vendor relationships, track deliveries, and optimize supply chain processes.",
                requirements: "Graduate in any stream. 1-3 years logistics/supply chain experience.",
                skills: ["Supply Chain", "Logistics", "Vendor Management", "ERP", "Coordination"],
                salaryRange: "₹3,00,000 - ₹6,50,000 / yr",
                status: "open"
            },
            {
                postedBy: recruiter._id,
                title: "Staff Nurse – ICU / General Ward",
                company: "Apollo Hospitals",
                location: "Chennai",
                type: "Full-time",
                description: "Provide patient care, administer medications, monitor vitals, and coordinate with doctors and paramedics in ICU and general ward.",
                requirements: "B.Sc Nursing / GNM. Valid nursing council registration. Freshers with 6-month internship may apply.",
                skills: ["Patient Care", "ICU", "Nursing", "Medication Administration", "Wound Care"],
                salaryRange: "₹2,80,000 - ₹5,00,000 / yr",
                status: "open"
            }
        ];

        await Job.insertMany(sampleJobs);
        console.log("Seeded sample jobs into database successfully.");
    } catch (err) {
        console.error("Error seeding jobs:", err.message);
    }
};
