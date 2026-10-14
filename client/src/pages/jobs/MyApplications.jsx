import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeftIcon, FileTextIcon, MapPinIcon } from 'lucide-react'
import api from '../../configs/api'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

const statusColors = {
  applied: 'bg-slate-100 text-slate-600',
  reviewed: 'bg-blue-50 text-blue-600',
  shortlisted: 'bg-amber-50 text-amber-600',
  accepted: 'bg-green-50 text-green-600',
  rejected: 'bg-red-50 text-red-600',
}

const MyApplications = () => {
  const { token } = useSelector(state => state.auth)
  const navigate = useNavigate()

  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.get('/api/applications/my', { headers: { Authorization: token } })
      .then(({ data }) => setApplications(data.applications))
      .catch(err => toast.error(err?.response?.data?.message || err.message))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <Loader />

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <button onClick={() => navigate('/app/jobs')} className='flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6'>
        <ArrowLeftIcon className='size-4' /> Back to Jobs
      </button>

      <h1 className='text-2xl font-medium bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent mb-6'>My Applications</h1>

      {applications.length === 0 ? (
        <div className='text-center mt-16'>
          <p className='text-slate-400'>You haven't applied to any jobs yet.</p>
          <button onClick={() => navigate('/app/jobs')} className='mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full text-sm transition-colors'>Browse Jobs</button>
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          {applications.filter(app => app.job).map(app => (
            <div key={app._id} className='bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <div className='cursor-pointer' onClick={() => navigate(`/app/jobs/${app.job._id}`)}>
                <h3 className='font-medium text-slate-800'>{app.job.title}</h3>
                <p className='text-sm text-slate-500'>{app.job.company}</p>
                <div className='flex items-center gap-4 mt-1 text-xs text-slate-400'>
                  <span className='flex items-center gap-1'><MapPinIcon className='size-3.5' />{app.job.location}</span>
                  <span className='flex items-center gap-1'><FileTextIcon className='size-3.5' />{app.resume?.title}</span>
                </div>
              </div>
              <span className={`text-xs px-3 py-1.5 rounded-full capitalize self-start sm:self-center ${statusColors[app.status]}`}>{app.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyApplications
