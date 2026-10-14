import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeftIcon } from 'lucide-react'
import api from '../../configs/api'
import toast from 'react-hot-toast'

const jobTypes = ["Full-time", "Part-time", "Internship", "Contract", "Remote"]

const emptyForm = {
  title: '', company: '', location: '', type: 'Full-time',
  description: '', requirements: '', skills: '', salaryRange: '', isNonIT: false
}

const PostJob = () => {
  const { jobId } = useParams()
  const isEdit = Boolean(jobId)
  const { token, user } = useSelector(state => state.auth)
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user && user.role !== 'recruiter') {
      toast.error('Only recruiters can post jobs')
      navigate('/app/jobs')
    }
  }, [user])

  useEffect(() => {
    if (isEdit) {
      api.get(`/api/jobs/${jobId}`).then(({ data }) => {
        const j = data.job
        setForm({
          title: j.title, company: j.company, location: j.location, type: j.type,
          description: j.description, requirements: j.requirements || '',
          skills: (j.skills || []).join(', '), salaryRange: j.salaryRange || '', isNonIT: Boolean(j.isNonIT)
        })
      }).catch(err => toast.error(err?.response?.data?.message || err.message))
    }
  }, [jobId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'isNonIT' ? value === 'non-it' : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (isEdit) {
        const { data } = await api.put('/api/jobs/update', { jobId, ...form }, { headers: { Authorization: token } })
        toast.success(data.message)
      } else {
        const { data } = await api.post('/api/jobs/create', form, { headers: { Authorization: token } })
        toast.success(data.message)
      }
      navigate('/app/jobs/my-postings')
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
    setSubmitting(false)
  }

  return (
    <div className='max-w-2xl mx-auto px-4 py-8'>
      <button onClick={() => navigate('/app/jobs/my-postings')} className='flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6'>
        <ArrowLeftIcon className='size-4' /> Back to My Postings
      </button>

      <div className='bg-white border border-slate-200 rounded-lg p-6'>
        <h1 className='text-xl font-medium text-slate-800 mb-6'>{isEdit ? 'Edit Job' : 'Post a New Job'}</h1>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='grid sm:grid-cols-2 gap-4'>
            <div>
              <label className='text-sm text-slate-700'>Job Title</label>
              <input name='title' value={form.title} onChange={handleChange} required className='w-full mt-1 px-4 py-2 border border-gray-300/80 rounded-md text-sm outline-none focus:border-indigo-500' />
            </div>
            <div>
              <label className='text-sm text-slate-700'>Company</label>
              <input name='company' value={form.company} onChange={handleChange} required className='w-full mt-1 px-4 py-2 border border-gray-300/80 rounded-md text-sm outline-none focus:border-indigo-500' />
            </div>
            <div>
              <label className='text-sm text-slate-700'>Location</label>
              <input name='location' value={form.location} onChange={handleChange} placeholder='e.g. Bengaluru, or Remote' className='w-full mt-1 px-4 py-2 border border-gray-300/80 rounded-md text-sm outline-none focus:border-indigo-500' />
            </div>
            <div>
              <label className='text-sm text-slate-700'>Job Type</label>
              <select name='type' value={form.type} onChange={handleChange} className='w-full mt-1 px-4 py-2 border border-gray-300/80 rounded-md text-sm outline-none focus:border-indigo-500'>
                {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className='text-sm text-slate-700'>Job Category</label>
              <select
                name='isNonIT'
                value={form.isNonIT ? 'non-it' : 'it'}
                onChange={handleChange}
                className='w-full mt-1 px-4 py-2 border border-gray-300/80 rounded-md text-sm outline-none focus:border-indigo-500'
              >
                <option value='it'>IT</option>
                <option value='non-it'>Non-IT</option>
              </select>
            </div>
          </div>

          <div>
            <label className='text-sm text-slate-700'>Salary Range (optional)</label>
            <input name='salaryRange' value={form.salaryRange} onChange={handleChange} placeholder='e.g. ₹8 - 12 LPA' className='w-full mt-1 px-4 py-2 border border-gray-300/80 rounded-md text-sm outline-none focus:border-indigo-500' />
          </div>

          <div>
            <label className='text-sm text-slate-700'>Skills (comma separated)</label>
            <input name='skills' value={form.skills} onChange={handleChange} placeholder='React, Node.js, MongoDB' className='w-full mt-1 px-4 py-2 border border-gray-300/80 rounded-md text-sm outline-none focus:border-indigo-500' />
          </div>

          <div>
            <label className='text-sm text-slate-700'>Description</label>
            <textarea name='description' value={form.description} onChange={handleChange} required rows={5} className='w-full mt-1 px-4 py-2 border border-gray-300/80 rounded-md text-sm outline-none focus:border-indigo-500' />
          </div>

          <div>
            <label className='text-sm text-slate-700'>Requirements (optional)</label>
            <textarea name='requirements' value={form.requirements} onChange={handleChange} rows={4} className='w-full mt-1 px-4 py-2 border border-gray-300/80 rounded-md text-sm outline-none focus:border-indigo-500' />
          </div>

          <button disabled={submitting} className='mt-2 py-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50'>
            {submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Post Job')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PostJob
