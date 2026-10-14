import { Lock, Mail, User2Icon, Eye, EyeOff } from 'lucide-react'
import React, { useState } from 'react'
import api from '../configs/api'
import { useDispatch } from 'react-redux'
import { login } from '../app/features/authSlice'
import toast from 'react-hot-toast'

const Login = () => {

    const dispatch = useDispatch()
  const query = new URLSearchParams(window.location.search)
  const urlState = query.get('state')
  const [state, setState] = useState(urlState || "login")
  const [showPassword, setShowPassword] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'jobseeker'
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data } = await api.post(`/api/users/${state}`, formData)
            dispatch(login(data))
            localStorage.setItem('token', data.token)
            toast.success(data.message)
        } catch (error) {
            toast(error?.response?.data?.message || error.message)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50 px-4'>
      <form onSubmit={handleSubmit} className="sm:w-[380px] w-full text-center border border-gray-300/60 rounded-2xl p-8 bg-white shadow-lg">
                <div className="flex justify-center mb-4">
                    <img src="/logo.svg" alt="resume.jobs" className="h-10 w-auto" />
                </div>
                <h1 className="text-gray-900 text-2xl font-bold">{state === "login" ? "Welcome Back" : "Create Account"}</h1>
                <p className="text-gray-500 text-sm mt-1">Please {state === "login" ? "login" : "sign up"} to access AI Resumes & Job Portal</p>
                {state !== "login" && (
                    <div className="flex items-center mt-6 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <User2Icon size={16} color='#6B7280'/>
                        <input type="text" name="name" placeholder="Name" className="border-none outline-none ring-0" value={formData.name} onChange={handleChange} required />
                    </div>
                )}
                <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <Mail size={13} color="#6B7280" />
                    <input type="email" name="email" placeholder="Email id" className="border-none outline-none ring-0" value={formData.email} onChange={handleChange} required />
                </div>
                {state !== "login" && (
                    <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-600">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name="role" value="jobseeker" checked={formData.role === 'jobseeker'} onChange={handleChange} />
                            Job Seeker
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" name="role" value="recruiter" checked={formData.role === 'recruiter'} onChange={handleChange} />
                            Recruiter
                        </label>
                    </div>
                )}
                <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 pr-4 gap-2">
                    <Lock size={13} color="#6B7280" className="shrink-0" />
                    <input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        placeholder="Password" 
                        className="border-none outline-none ring-0 flex-1 text-sm bg-transparent" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(prev => !prev)} 
                        className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1 cursor-pointer shrink-0"
                        title={showPassword ? "Hide password" : "Show password"}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                <div className="mt-4 text-left text-indigo-600 font-medium">
                    <button className="text-sm hover:underline" type="button">Forgot password?</button>
                </div>
                <button type="submit" className="mt-3 w-full h-11 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer">
                    {state === "login" ? "Login" : "Sign up"}
                </button>
                <p onClick={() => setState(prev => prev === "login" ? "register" : "login")} className="text-slate-500 text-sm mt-4 mb-4 cursor-pointer">{state === "login" ? "Don't have an account?" : "Already have an account?"} <span className="text-indigo-600 font-semibold hover:underline">click here</span></p>
            </form>
    </div>
  )
}

export default Login
