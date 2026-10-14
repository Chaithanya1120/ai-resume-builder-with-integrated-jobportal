import React from 'react'
import { Link } from 'react-router-dom'

const CallToAction = () => {
  return (
    <div id='cta' className='border-y border-dashed border-slate-200 w-full max-w-5xl mx-auto px-10 sm:px-16 mt-28'>
            <div className="flex flex-col md:flex-row text-center md:text-left items-center justify-between gap-8 px-3 md:px-10 border-x border-dashed border-slate-200 py-16 sm:py-20 -mt-10 -mb-10 w-full">
                <p className="text-xl font-semibold max-w-md text-slate-800">Build an AI Resume & Apply for Top Jobs Direct on our Portal</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link to="/app" className="flex items-center gap-2 rounded-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 transition text-white text-sm font-semibold shadow-md shadow-indigo-600/20">
                      <span>Build AI Resume</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </Link>
                  <Link to="/app/jobs" className="flex items-center gap-2 rounded-full py-3 px-6 bg-blue-600 hover:bg-blue-700 transition text-white text-sm font-semibold shadow-md shadow-blue-600/20">
                      <span>Explore Jobs</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
                  </Link>
                </div>
            </div>
        </div>
  )
}

export default CallToAction

