import { Zap, Sparkles, Briefcase, FileCheck } from 'lucide-react';
import React from 'react'
import Title from './Title';

const Features = () => {
  return (
    <div id='features' className='flex flex-col items-center my-10 scroll-mt-12'>

    <div className="flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 border border-indigo-200/80 rounded-full px-6 py-1.5 font-semibold">
        <Zap width={14} className="text-indigo-600" />
        <span>All-In-One Career Platform</span>
    </div>
    <Title title='AI Resume Builder & Job Portal' description='Create professional ATS-friendly resumes with AI assistance and apply directly to verified openings on our Job Portal.'/>

            <div className="flex flex-col md:flex-row items-center xl:-mt-6 gap-8">
                <div className="px-4 md:px-0 space-y-4 max-w-xl">
                    <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl shadow-xs">
                        <div className="p-3 bg-blue-600 text-white rounded-lg shadow-sm">
                            <Sparkles className="size-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800">AI-Powered Resume Assistance</h3>
                            <p className="text-sm text-slate-600">Enhance summary, parse PDF resumes, and generate polished ATS templates instantly.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 rounded-xl shadow-xs">
                        <div className="p-3 bg-indigo-600 text-white rounded-lg shadow-sm">
                            <Briefcase className="size-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800">Integrated Job Portal</h3>
                            <p className="text-sm text-slate-600">Browse verified jobs, filter by role & location, and submit applications with one click.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl shadow-xs">
                        <div className="p-3 bg-slate-800 text-white rounded-lg shadow-sm">
                            <FileCheck className="size-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-800">Recruiter & Candidate Hub</h3>
                            <p className="text-sm text-slate-600">Post jobs as a recruiter, review applicant resumes directly, and track hiring status.</p>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
        </div>
  )
}

export default Features

