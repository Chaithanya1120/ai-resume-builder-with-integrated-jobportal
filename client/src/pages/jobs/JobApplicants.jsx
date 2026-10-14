import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeftIcon, FileTextIcon, MailIcon } from 'lucide-react'
import api from '../../configs/api'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'

const statusOptions = ["applied", "reviewed", "shortlisted", "rejected", "accepted"]

const statusColors = {
  applied: 'bg-slate-100 text-slate-600',
  reviewed: 'bg-blue-50 text-blue-600',
  shortlisted: 'bg-amber-50 text-amber-600',
  accepted: 'bg-green-50 text-green-600',
  rejected: 'bg-red-50 text-red-600',
}

const JobApplicants = () => {
  const { jobId } = useParams()
  const { token } = useSelector(state => state.auth)
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const load = async () => {
    try {
      const { data } = await api.get(`/api/applications/job/${jobId}`, { headers: { Authorization: token } })
      setJob(data.job)
      setApplications(data.applications)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
    setIsLoading(false)
  }

  useEffect(() => { load() }, [jobId])

  const updateStatus = async (applicationId, status) => {
    try {
      const { data } = await api.put('/api/applications/status', { applicationId, status }, { headers: { Authorization: token } })
      setApplications(applications.map(a => a._id === applicationId ? { ...a, status } : a))
      toast.success(data.message)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  if (isLoading) return <Loader />

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <button onClick={() => navigate('/app/jobs/my-postings')} className='flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6'>
        <ArrowLeftIcon className='size-4' /> Back to My Postings
      </button>

      <h1 className='text-2xl font-medium bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent'>{job?.title}</h1>
      <p className='text-slate-500 text-sm mt-1 mb-6'>{applications.length} applicant{applications.length === 1 ? '' : 's'}</p>

      {applications.length === 0 ? (
        <p className='text-center text-slate-400 mt-16'>No applicants yet.</p>
      ) : (
        <div className='flex flex-col gap-3'>
          {applications.map(app => (
            <div key={app._id} className='bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <div>
                <h3 className='font-medium text-slate-800'>{app.applicant?.name}</h3>
                <p className='text-sm text-slate-500 flex items-center gap-1.5'><MailIcon className='size-3.5' />{app.applicant?.email}</p>
                <p className='text-xs text-slate-400 mt-1'>Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                {app.coverLetter && <p className='text-sm text-slate-600 mt-2 italic'>"{app.coverLetter}"</p>}
              </div>
              <div className='flex items-center gap-3'>
                <a href={`/view/${app.resume?._id}`} target='_blank' rel='noreferrer' className='flex items-center gap-1.5 text-sm border border-gray-300 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors whitespace-nowrap'>
                  <FileTextIcon className='size-4' /> View Resume
                </a>
                <select value={app.status} onChange={e => updateStatus(app._id, e.target.value)} className={`text-xs px-3 py-1.5 rounded-full border-none outline-none capitalize ${statusColors[app.status]}`}>
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default JobApplicants
