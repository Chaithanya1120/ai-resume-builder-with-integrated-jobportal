import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../app/features/authSlice';
import { FileTextIcon, BriefcaseIcon, LogOutIcon } from 'lucide-react';

const Navbar = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const logoutUser = () => {
    navigate('/');
    dispatch(logout());
  };

  const isJobsActive = location.pathname.startsWith('/app/jobs');
  const isResumesActive = location.pathname === '/app' || location.pathname.startsWith('/app/builder');

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <nav className="flex items-center justify-between max-w-7xl mx-auto px-4 py-3 text-slate-800">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.svg" alt="logo" className="h-10 w-auto group-hover:scale-105 transition-transform" />
        </Link>

        {/* Navigation Toggles: Resumes <-> Jobs */}
        <div className="flex items-center bg-slate-100/80 p-1.5 rounded-full border border-slate-200/70 shadow-inner">
          <Link
            to="/app"
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
              isResumesActive
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60 scale-102'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <FileTextIcon className="size-4 text-indigo-500" />
            <span>Resumes</span>
          </Link>

          <Link
            to="/app/jobs"
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
              isJobsActive
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60 scale-102'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <BriefcaseIcon className="size-4 text-indigo-500" />
            <span>Jobs</span>
          </Link>
        </div>

        {/* Right side: user info + logout */}
        <div className="flex items-center gap-3">
          {/* User name */}
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs text-slate-400 font-medium">Welcome back,</span>
            <span className="text-sm font-bold text-slate-800 line-clamp-1">{user?.name || 'User'}</span>
          </div>

          {/* Logout */}
          <button
            onClick={logoutUser}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 border border-slate-200 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <LogOutIcon className="size-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

