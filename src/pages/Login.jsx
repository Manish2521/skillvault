import { useState, useRef, useMemo } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import LoadingBar from "react-top-loading-bar"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../index.css"
// import dotenv from "dotenv";

const backendUrl = import.meta.env.VITE_BACKEND_URL;


export default function Login({ setToken }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const loadingBar = useRef(null)
  const navigate = useNavigate()

  const emailValid = useMemo(() => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(formData.email)
  }, [formData.email])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "email" ? value.toLowerCase() : value,
    })
  }

  const toggleShowPassword = () => setShowPassword((prev) => !prev)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!emailValid || !formData.password.trim()) return
    setLoading(true)
    loadingBar.current.continuousStart()

    try {
      const res = await axios.post(
        `${backendUrl}/api/auth/login`,
        formData,
        { validateStatus: (s) => s < 500 }
      )
      // console.log("----------------------------");
      // console.log(res);
      // console.log("------------------------------");
      if (res.status === 200) {
        toast.success("Login successful!", { autoClose: 1500 })
        loadingBar.current.complete()

        const user = res.data.user.name.split(' ')[0]
        const token = res.data.token || "testtoken123" 

        localStorage.setItem("token", token)
        localStorage.setItem("username", user)

        setToken(token)  
        setLoading(false)
        // navigate("/resumes")


        setTimeout(() => {
          navigate("/resumes")
        }, 500) 

      } else if (res.status === 401) {
        toast.error("Invalid credentials.", { autoClose: 2500 })
        loadingBar.current.complete()
        setLoading(false)
      } else {
        throw new Error("Unknown error")
      }
    } catch (err) {
      loadingBar.current.complete()
      setLoading(false)
      toast.error("Login failed. Please try again.", { autoClose: 3000 })
      console.error(err)
    }
  }

  return (
    <div className="relative flex justify-center items-start min-h-screen bg-gradient-to-tr from-blue-100 via-purple-100 to-pink-100 p-4 sm:p-6 md:p-8 lg:p-12 pt-12 sm:pt-16">
      <LoadingBar color="#3b82f6" ref={loadingBar} shadow />

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-xl w-full max-w-sm sm:max-w-md md:max-w-md space-y-6"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-800">
          Welcome Back
        </h2>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-sm border ${
              formData.email && !emailValid ? "border-red-400" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
            required
          />
          {!emailValid && formData.email && (
            <p className="mt-1 text-xs text-red-500">Please enter a valid email address.</p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-3 top-[2.6rem] text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!emailValid || !formData.password.trim() || loading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition ${
            !emailValid || !formData.password.trim() || loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt- text-sm text-center text-gray-600">
        New here?{" "}
        <span
            onClick={() => navigate("/signup")}
            className="text-blue-600 hover:underline cursor-pointer font-medium"
        >
            Click here to Signup
        </span>
        </p>
        
      </form>

      <ToastContainer />
    </div>
  )
}
