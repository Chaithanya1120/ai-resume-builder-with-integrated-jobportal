
import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import ResumeBuilder from './pages/ResumeBuilder'
import Preview from './pages/Preview'
import Login from './pages/Login'
import JobPortal from './pages/jobs/JobPortal'
import JobDetails from './pages/jobs/JobDetails'
import PostJob from './pages/jobs/PostJob'
import MyPostings from './pages/jobs/MyPostings'
import JobApplicants from './pages/jobs/JobApplicants'
import MyApplications from './pages/jobs/MyApplications'
import { useDispatch } from 'react-redux'
import api from './configs/api'
import { login, setLoading } from './app/features/authSlice'
import {Toaster} from 'react-hot-toast'

const App = () => {

  const dispatch = useDispatch()

  const getUserData = async () => {
    const token = localStorage.getItem('token')
    try {
      if(token){
        const { data } = await api.get('/api/users/data', {headers: {Authorization: token}})
        if(data.user){
          dispatch(login({token, user: data.user}))
        }
        dispatch(setLoading(false))
      }else{
        dispatch(setLoading(false))
      }
    } catch (error) {
      dispatch(setLoading(false))
      console.log(error.message)
    }
  }

  useEffect(()=>{
    getUserData()
  },[])

  return (
    <>
    <Toaster
      toastOptions={{
        success: {
          iconTheme: {
            primary: '#4f46e5',
            secondary: '#ffffff',
          },
          style: {
            borderLeft: '4px solid #4f46e5',
          },
        },
      }}
    />
      <Routes>
        <Route path='/' element={<Home />}/>

        <Route path='app' element={<Layout />}>
          <Route index element={<Dashboard />}/>
          <Route path='builder/:resumeId' element={<ResumeBuilder />}/>

          <Route path='jobs' element={<JobPortal />}/>
          <Route path='jobs/post' element={<PostJob />}/>
          <Route path='jobs/my-postings' element={<MyPostings />}/>
          <Route path='jobs/my-applications' element={<MyApplications />}/>
          <Route path='jobs/:jobId' element={<JobDetails />}/>
          <Route path='jobs/:jobId/edit' element={<PostJob />}/>
          <Route path='jobs/:jobId/applicants' element={<JobApplicants />}/>
        </Route>

        <Route path='view/:resumeId' element={<Preview />}/>

      </Routes>
    </>
  )
}

export default App
