# AI Resume Builder + Job Portal (Combined Project)

Your original AI Resume Builder is untouched — the Job Portal has been added on top of it
as a second feature inside the **same** MERN app (same server, same database, same login).

## What was added

### Backend (`server/`)
- `models/Job.js` — job postings
- `models/Application.js` — applications (links a Job + a User + one of their Resumes)
- `models/User.js` — added a `role` field: `"jobseeker"` (default) or `"recruiter"`
- `controllers/jobController.js`, `routes/jobRoutes.js` — job CRUD + search (`/api/jobs`)
- `controllers/applicationController.js`, `routes/applicationRoutes.js` — apply / track / review (`/api/applications`)
- `server.js` — the two new routers are mounted; everything else is unchanged

No new environment variables are needed — it reuses your existing `MONGODB_URI` and `JWT_SECRET`.

### Frontend (`client/src`)
- `pages/jobs/JobPortal.jsx` — browse & search open jobs
- `pages/jobs/JobDetails.jsx` — job details + **Apply Now** (pick one of your existing resumes + optional cover letter)
- `pages/jobs/PostJob.jsx` — post/edit a job (recruiters only)
- `pages/jobs/MyPostings.jsx` — recruiter's own postings + applicant counts
- `pages/jobs/JobApplicants.jsx` — recruiter reviews applicants, views their resume, updates status
- `pages/jobs/MyApplications.jsx` — jobseeker's applications + status tracking
- `App.jsx` — new routes added under `/app/jobs/*`
- `Navbar.jsx` — added a "Jobs" link
- `Dashboard.jsx` — added a banner: **"Your resume is ready. Now find a job!" → Apply for Jobs**
  (shown to jobseekers after they have at least one resume) and a **"Post a Job"** banner for recruiters
- `Login.jsx` — sign up now asks whether you're a **Job Seeker** or **Recruiter**

## How the two projects connect

1. Sign up choosing **Job Seeker** (or **Recruiter** if you want to post jobs).
2. As a job seeker: build a resume as usual on the Dashboard.
3. A banner appears: **"Apply for Jobs →"** — click it, or use the **Jobs** link in the navbar.
4. Browse/search jobs → open one → **Apply Now** → pick which of your resumes to submit + write an optional cover letter.
5. Track status any time under **My Applications**.
6. As a recruiter: **Post a Job** from the Dashboard banner or Jobs page, then view applicants
   under **My Postings → Applicants**. Each applicant's resume opens using your existing public
   resume preview page (`/view/:resumeId`) — no duplicate resume storage, it's the *same* Resume document.

## Running it

Nothing changes about how you start the app — same as before:

```bash
# server
cd server
npm install
npm run server   # nodemon

# client
cd client
npm install
npm run dev
```

Both features run from the one server (port from `server/.env`) and one client (Vite dev server).

## Notes / things you may want to tweak

- A user's `role` is set once at sign-up. If you want existing accounts to become recruiters,
  update the `role` field on that user document in MongoDB directly (or add a settings toggle).
- Applying to a job automatically marks the chosen resume as `public: true` (same flag your
  original app already uses for shareable resume links) so the recruiter can open it.
- Job search filters (`search`, `location`, `type`) are simple case-insensitive matches — good
  enough for a project/demo; swap in a proper text index if you need it to scale.
