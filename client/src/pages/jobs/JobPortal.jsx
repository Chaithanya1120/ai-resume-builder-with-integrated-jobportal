import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  BriefcaseIcon,
  MapPinIcon,
  SearchIcon,
  PlusIcon,
  ClipboardListIcon,
  ExternalLinkIcon,
  SparklesIcon,
  GlobeIcon,
  FilterIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  GraduationCapIcon,
  XIcon
} from 'lucide-react';
import api from '../../configs/api';
import toast from 'react-hot-toast';

const jobTypes = ["Full-time", "Part-time", "Internship", "Contract", "Remote"];

const sourcesList = [
  { id: 'all', label: 'All Openings', icon: GlobeIcon },
  { id: 'fresher', label: 'Freshers / Entry Level 🎓', icon: GraduationCapIcon, isHighlight: true },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'naukri', label: 'Naukri.com' },
  { id: 'indeed', label: 'Indeed' },
  { id: 'google', label: 'Google Jobs' },
  { id: 'internal', label: 'Internal Postings' },
];

const JobPortal = () => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [activeSource, setActiveSource] = useState('all');

  const loadJobsWithParams = async (s = search, loc = location, t = type, src = activeSource) => {
    setIsLoading(true);
    try {
      const params = {};
      if (s) params.search = s;
      if (loc) params.location = loc;
      if (t) params.type = t;
      if (src === 'fresher') {
        params.fresher = 'true';
      } else if (src && src !== 'all') {
        params.source = src;
      }

      const { data } = await api.get('/api/jobs', { params });
      setJobs(data.jobs || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobsWithParams(search, location, type, activeSource);
  }, [activeSource]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadJobsWithParams(search, location, type, activeSource);
  };

  const handleReset = () => {
    setSearch('');
    setLocation('');
    setType('');
    setActiveSource('all');
    loadJobsWithParams('', '', '', 'all');
  };

  const hasFilters = Boolean(search || location || type || activeSource !== 'all');

  const getSourceBadge = (sourceName = 'LinkedIn') => {
    const name = String(sourceName).toLowerCase();
    if (name.includes('linkedin')) {
      return { label: 'LinkedIn', bg: 'bg-[#0a66c2]/10 text-[#0a66c2] border-[#0a66c2]/20' };
    }
    if (name.includes('naukri')) {
      return { label: 'Naukri.com', bg: 'bg-[#275df5]/10 text-[#275df5] border-[#275df5]/20' };
    }
    if (name.includes('indeed')) {
      return { label: 'Indeed', bg: 'bg-[#003a9b]/10 text-[#003a9b] border-[#003a9b]/20' };
    }
    if (name.includes('google')) {
      return { label: 'Google Jobs', bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' };
    }
    if (name.includes('glassdoor')) {
      return { label: 'Glassdoor', bg: 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20' };
    }
    return { label: sourceName || 'Direct', bg: 'bg-violet-500/10 text-violet-700 border-violet-500/20' };
  };

  return (
    <div className="min-h-screen gradient-hero-bg pb-16">
      {/* Top Banner & Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 shadow-2xl mb-8 border border-slate-800">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 live-indicator"></span>
                Real-Time Live Job Aggregator
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                Find Live Jobs & Apply Instantaneously
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Explore real-time vacancies aggregated directly from <span className="text-indigo-300 font-semibold">LinkedIn, Naukri, Indeed, Google Jobs & Company Portals</span>. Match and submit with your custom AI resume.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {user?.role === 'recruiter' ? (
                <>
                  <button
                    onClick={() => navigate('/app/jobs/my-postings')}
                    className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
                  >
                    <ClipboardListIcon className="size-4 text-indigo-400" /> My Postings
                  </button>
                  <button
                    onClick={() => navigate('/app/jobs/post')}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25"
                  >
                    <PlusIcon className="size-4" /> Post a Job
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/app/jobs/my-applications')}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25"
                >
                  <ClipboardListIcon className="size-4" /> Track My Applications
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search Toolbar */}
        <form onSubmit={handleSearch} className="glass-card p-4 sm:p-5 rounded-2xl mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5 flex items-center bg-slate-50/80 border border-slate-200/80 rounded-xl px-3.5 h-12 gap-2.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
              <SearchIcon className="size-4 text-indigo-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                type="text"
                placeholder="Job title, skills, or company (e.g. React, Python)"
                className="w-full bg-transparent border-none outline-none text-slate-800 text-sm placeholder:text-slate-400"
              />
            </div>

            <div className="sm:col-span-4 flex items-center bg-slate-50/80 border border-slate-200/80 rounded-xl px-3.5 h-12 gap-2.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
              <MapPinIcon className="size-4 text-indigo-500" />
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                type="text"
                placeholder="Location (e.g. Bangalore, Remote)"
                className="w-full bg-transparent border-none outline-none text-slate-800 text-sm placeholder:text-slate-400"
              />
            </div>

            <div className="sm:col-span-3 flex gap-2">
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl px-3 h-12 text-sm text-slate-700 outline-none focus:border-indigo-500 transition-all"
              >
                <option value="">All Types</option>
                {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 h-12 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 shrink-0 cursor-pointer"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Source Pills Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1">
            <FilterIcon className="size-3.5" /> Source Filter:
          </span>
          {sourcesList.map(src => (
            <button
              key={src.id}
              onClick={() => setActiveSource(src.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                activeSource === src.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {src.label}
            </button>
          ))}
          {hasFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium px-3 py-2 rounded-full hover:bg-rose-50 transition-colors ml-auto cursor-pointer"
            >
              <XIcon className="size-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* Job Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="glass-card p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl skeleton-shimmer"></div>
                    <div className="space-y-2">
                      <div className="w-40 h-4 rounded skeleton-shimmer"></div>
                      <div className="w-24 h-3 rounded skeleton-shimmer"></div>
                    </div>
                  </div>
                  <div className="w-16 h-5 rounded-full skeleton-shimmer"></div>
                </div>
                <div className="w-full h-10 rounded skeleton-shimmer"></div>
                <div className="flex gap-2">
                  <div className="w-16 h-6 rounded-full skeleton-shimmer"></div>
                  <div className="w-16 h-6 rounded-full skeleton-shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass-card text-center py-16 px-6 rounded-3xl">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <BriefcaseIcon className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No Jobs Found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              We couldn't find any real-time listings matching your filter criteria. Try searching for a broader title or location.
            </p>
            {hasFilters && (
              <button
                onClick={handleReset}
                className="mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md"
              >
                Reset Search Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jobs.map(job => {
              const sourceBadge = getSourceBadge(job.source);
              return (
                <div
                  key={job._id}
                  onClick={() => navigate(`/app/jobs/${job._id}`)}
                  className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between cursor-pointer border border-slate-200/90 relative group"
                >
                  <div>
                    {/* Card Top Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {job.companyLogo ? (
                          <img
                            src={job.companyLogo}
                            alt={job.company}
                            className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-100 p-1 shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg items-center justify-center shrink-0 shadow-sm"
                          style={{ display: job.companyLogo ? 'none' : 'flex' }}
                        >
                          {job.company ? job.company.charAt(0).toUpperCase() : 'J'}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {job.title}
                          </h3>
                          <p className="text-sm font-medium text-slate-600">{job.company}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {job.isFresher && (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs tracking-wide">
                            FRESHER PREFERRED 🎓
                          </span>
                        )}
                        {job.isNonIT && (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-orange-500 text-white shadow-xs tracking-wide">
                            NON-IT 🏢 {job.sector ? `· ${job.sector}` : ''}
                          </span>
                        )}
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${sourceBadge.bg}`}>
                          {sourceBadge.label}
                        </span>
                        <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-medium">
                          {job.type}
                        </span>
                      </div>
                    </div>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 my-3">
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="size-3.5 text-indigo-500" />
                        {job.location}
                      </span>
                      {job.salaryRange && (
                        <span className="flex items-center gap-1 text-slate-700 font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
                          <BriefcaseIcon className="size-3.5 text-emerald-600" />
                          {job.salaryRange}
                        </span>
                      )}
                    </div>

                    {/* Description preview */}
                    <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-4">
                      {job.description}
                    </p>

                    {/* Skill tags */}
                    {job.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {job.skills.slice(0, 4).map((skill, i) => (
                          <span
                            key={i}
                            className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium border border-slate-200/60"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="text-[11px] text-slate-400 px-1 py-1 font-medium">
                            +{job.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <span className="text-xs text-slate-400">
                      {job.isExternal ? 'Live Aggregated' : 'Verified Recruiter'}
                    </span>
                    <button className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                      View Details & Apply <ArrowRightIcon className="size-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPortal;
