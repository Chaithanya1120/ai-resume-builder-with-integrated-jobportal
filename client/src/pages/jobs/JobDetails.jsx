import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeftIcon,
  MapPinIcon,
  BriefcaseIcon,
  XIcon,
  FileTextIcon,
  PlusIcon,
  ExternalLinkIcon,
  CheckCircle2Icon,
  BuildingIcon,
  SparklesIcon,
  GlobeIcon
} from 'lucide-react';
import api from '../../configs/api';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';

const JobDetails = () => {
  const { jobId } = useParams();
  const { token, user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadJob = async () => {
    try {
      const { data } = await api.get(`/api/jobs/${jobId}`);
      setJob(data.job);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadResumes = async () => {
    try {
      const { data } = await api.get('/api/users/resumes', { headers: { Authorization: token } });
      setResumes(data.resumes || []);
      if (data.resumes?.length > 0) setSelectedResumeId(data.resumes[0]._id);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const openApply = () => {
    if (!user) {
      toast.error('Please sign in to apply');
      navigate('/app/login');
      return;
    }
    loadResumes();
    setShowApply(true);
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      toast.error('Please select or create a resume first');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post(
        '/api/applications/apply',
        {
          jobId,
          resumeId: selectedResumeId,
          coverLetter,
        },
        { headers: { Authorization: token } }
      );
      toast.success(data.message);
      setShowApply(false);
      navigate('/app'); // Navigates directly back to the Resume Builder Dashboard page
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <Loader />;

  if (!job) {
    return (
      <div className="min-h-screen gradient-hero-bg py-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="glass-card p-8 rounded-3xl max-w-md w-full">
          <BuildingIcon className="size-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">Listing Not Found</h2>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            The job listing you are looking for may have expired or been removed.
          </p>
          <button
            onClick={() => navigate('/app/jobs')}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl shadow-md"
          >
            Back to Job Board
          </button>
        </div>
      </div>
    );
  }

  const isExternal = Boolean(job.isExternal || job.applyUrl);
  const sourceName = job.source || (isExternal ? 'LinkedIn' : 'Internal');

  return (
    <div className="min-h-screen gradient-hero-bg pb-16 pt-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation back link */}
        <button
          onClick={() => navigate('/app/jobs')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeftIcon className="size-4" /> Back to All Listings
        </button>

        {/* Main Job Detail Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 mb-8 border border-slate-200/90 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header Row */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200/80">
            <div className="flex items-start gap-4">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={job.company}
                  className="w-16 h-16 rounded-2xl object-contain bg-white border border-slate-200 p-2 shadow-sm shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold text-2xl items-center justify-center shrink-0 shadow-md"
                style={{ display: job.companyLogo ? 'none' : 'flex' }}
              >
                {job.company ? job.company.charAt(0).toUpperCase() : 'J'}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    Source: {sourceName}
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {job.type}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {job.title}
                </h1>
                <p className="text-base font-semibold text-slate-600 mt-1 flex items-center gap-2">
                  <BuildingIcon className="size-4 text-indigo-500" /> {job.company}
                </p>
              </div>
            </div>

            {/* Application CTA Header */}
            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              {isExternal ? (
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all scale-100 hover:scale-105"
                >
                  Apply on {sourceName} <ExternalLinkIcon className="size-4" />
                </a>
              ) : user?.role !== 'recruiter' ? (
                <button
                  onClick={openApply}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all scale-100 hover:scale-105"
                >
                  <SparklesIcon className="size-4 text-yellow-300" /> Apply with AI Resume
                </button>
              ) : null}
            </div>
          </div>

          {/* Quick Details Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <MapPinIcon className="size-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Location</p>
                <p className="text-sm font-bold text-slate-800">{job.location || 'Remote'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <BriefcaseIcon className="size-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Compensation</p>
                <p className="text-sm font-bold text-emerald-700">{job.salaryRange || 'Competitive Market Pay'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <GlobeIcon className="size-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Listing Type</p>
                <p className="text-sm font-bold text-slate-800">{job.isExternal ? 'Live Aggregated' : 'Verified Partner'}</p>
              </div>
            </div>
          </div>

          {/* Skills Required */}
          {job.skills?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Key Skills & Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold bg-white border border-slate-200/90 text-indigo-700 px-3 py-1.5 rounded-xl shadow-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Description */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
              Job Description
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-white/60 p-4 rounded-2xl border border-slate-200/60">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                Requirements & Qualifications
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-white/60 p-4 rounded-2xl border border-slate-200/60">
                {job.requirements}
              </p>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Found a match? Apply directly or use your built-in AI Resume.
            </div>
            {isExternal ? (
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold px-6 py-3 rounded-2xl shadow-md transition-all"
              >
                Go to {sourceName} Application Page <ExternalLinkIcon className="size-4" />
              </a>
            ) : user?.role !== 'recruiter' ? (
              <button
                onClick={openApply}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-2xl shadow-md transition-all"
              >
                Submit Application
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Built-in Apply Modal */}
      {showApply && (
        <div
          onClick={() => setShowApply(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <form
            onSubmit={submitApplication}
            onClick={e => e.stopPropagation()}
            className="relative glass-card border border-slate-200 shadow-2xl rounded-3xl w-full max-w-lg p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => setShowApply(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <XIcon className="size-5" />
            </button>

            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <SparklesIcon className="size-4" /> AI Resume Application
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Apply to {job.title}</h2>
            <p className="text-sm font-medium text-slate-500 mb-6">{job.company}</p>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Your AI Resume
              </label>
              {resumes.length === 0 ? (
                <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-2xl p-4 text-sm flex items-center justify-between gap-3">
                  <span>You have not generated any resumes yet.</span>
                  <button
                    type="button"
                    onClick={() => navigate('/app')}
                    className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
                  >
                    <PlusIcon className="size-4" /> Build Resume
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {resumes.map(resume => (
                    <label
                      key={resume._id}
                      className={`flex items-center gap-3 border rounded-2xl p-3.5 cursor-pointer transition-all ${
                        selectedResumeId === resume._id
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="resume"
                        value={resume._id}
                        checked={selectedResumeId === resume._id}
                        onChange={() => setSelectedResumeId(resume._id)}
                        className="accent-indigo-600 size-4"
                      />
                      <FileTextIcon className="size-5 text-indigo-500 shrink-0" />
                      <span className="font-semibold text-slate-800 text-sm line-clamp-1">{resume.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Optional Cover Letter / Note
              </label>
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                rows={3}
                placeholder="Introduce yourself or highlight specific qualifications..."
                className="w-full text-sm p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || resumes.length === 0}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Submitting Application...' : 'Send Application'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
