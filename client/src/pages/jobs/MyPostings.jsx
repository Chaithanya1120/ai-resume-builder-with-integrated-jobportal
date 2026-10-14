import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeftIcon, PlusIcon, UsersIcon, PencilIcon, TrashIcon } from 'lucide-react'
import api from '../../configs/api'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

const MyPostings = () => {
  const { token } = useSelector(state => state.auth)
  const navigate = useNavigate()

  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const loadJobs = async () => {
    try {
      const { data } = await api.get('/api/jobs/my/postings', { headers: { Authorization: token } })
      setJobs(data.jobs)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
    setIsLoading(false)
  }

  useEffect(() => { loadJobs() }, [])

  const deleteJob = async (jobId) => {
    const confirm = window.confirm('Delete this job posting and all its applications?')
    if (!confirm) return
    try {
      const { data } = await api.delete(`/api/jobs/delete/${jobId}`, { headers: { Authorization: token } })
      setJobs(jobs.filter(j => j._id !== jobId))
      toast.success(data.message)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  if (isLoading) return <Loader />

  return (
    <div className='max-w-5xl mx-auto px-4 py-8'>
      <button onClick={() => navigate('/app/jobs')} className='flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6'>
        <ArrowLeftIcon className='size-4' /> Back to Jobs
      </button>

      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-medium bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent'>My Postings</h1>
        <button onClick={() => navigate('/app/jobs/post')} className='flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm transition-colors'>
          <PlusIcon className='size-4' /> Post a Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <p className='text-center text-slate-400 mt-16'>You haven't posted any jobs yet.</p>
      ) : (
        <div className='flex flex-col gap-3'>
          {jobs.map(job => (
            <div key={job._id} className='bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between gap-4'>
              <div className='cursor-pointer' onClick={() => navigate(`/app/jobs/${job._id}`)}>
                <h3 className='font-medium text-slate-800'>{job.title}</h3>
                <p className='text-sm text-slate-500'>{job.company} · {job.location} · {job.type}</p>
                <p className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${job.status === 'open' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>{job.status}</p>
              </div>
              <div className='flex items-center gap-2'>
                <button onClick={() => navigate(`/app/jobs/${job._id}/applicants`)} className='flex items-center gap-1.5 text-sm border border-gray-300 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors whitespace-nowrap'>
                  <UsersIcon className='size-4' /> {job.applicantCount} Applicant{job.applicantCount === 1 ? '' : 's'}
                </button>
                <PencilIcon onClick={() => navigate(`/app/jobs/${job._id}/edit`)} className='size-8 p-1.5 hover:bg-slate-100 rounded text-slate-500 cursor-pointer transition-colors' />
                <TrashIcon onClick={() => deleteJob(job._id)} className='size-8 p-1.5 hover:bg-slate-100 rounded text-slate-500 cursor-pointer transition-colors' />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyPostings
