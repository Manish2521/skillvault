import { useState, useRef, useMemo } from "react";
import React, { useEffect } from "react"; 
import axios from "axios";
import { useNavigate , useLocation } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../index.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]       = useState(false);
  const loadingBar                  = useRef(null);
  const navigate                    = useNavigate();


  /* ---------- Derived values ---------- */
  const emailValid = useMemo(() => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(formData.email);
  }, [formData.email]);

  const passwordStrength = useMemo(() => {
    const { password } = formData;
    let score = 0;
    if (password.length >= 4)                    score += 1;
    if (/[a-z]/.test(password))                  score += 1;
    if (/[A-Z]/.test(password))                  score += 1;
    if (/\d/.test(password))                     score += 1;
    if (/[^A-Za-z0-9]/.test(password))           score += 1;
    return score; // 0-5
  }, [formData.password]);

  const strengthLabel = ["Too short","Weak","Fair","Good","Strong","Excellent"][passwordStrength];
  const strengthColor = ["bg-gray-300","bg-red-500","bg-yellow-400","bg-yellow-500","bg-green-500","bg-green-600"][passwordStrength];
  const strengthWidth = ["w-0","w-1/5","w-2/5","w-3/5","w-4/5","w-full"][passwordStrength];

  /* ---------- Handlers ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
        ...formData,
        [name]: name === "email" ? value.toLowerCase() : value,
    });
    };

  const toggleShowPassword = () => setShowPassword(prev => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailValid || passwordStrength < 4) return; // extra guard
    setLoading(true);
    loadingBar.current.continuousStart();

    try {
      /* 1️⃣  Check duplicate (min 2-sec UI) */
      const t0   = Date.now();
      const check = await axios.get(`${backendUrl}/api/auth/checkUser`, {
        params: { email: formData.email },
        validateStatus: (s) => s < 500,
      });
      const lag = 2000 - (Date.now() - t0);
      if (lag > 0) await new Promise(r => setTimeout(r, lag));
      if (check.data.exists) throw { duplicate:true };

      /* 2️⃣  Signup */
      const res = await axios.post(
        `${backendUrl}/api/auth/signup`,
        formData,
        { validateStatus: (s) => s < 500 }
      );

      if (res.status === 201) {
        toast.success("Signup successful!", { autoClose:2000 });
        loadingBar.current.complete();
        setLoading(false);
        setTimeout(() => navigate("/login"), 2100);
      } else if (res.status === 409) {
        throw { duplicate:true };
      } else {
        throw new Error("Unknown error");
      }
    } catch (err) {
      loadingBar.current.complete();
      setLoading(false);
      if (err.duplicate) {
        toast.error("User already exists — choose another email.", { autoClose:3000 });
      } else {
        toast.error("Signup failed. Please try again.", { autoClose:3000 });
        console.error(err);
      }
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="relative flex justify-center items-start min-h-screen bg-gradient-to-tr from-blue-100 via-purple-100 to-pink-100 pt-12 sm:pt-16 pb-0 px-4 sm:px-6 md:px-8 lg:px-12">
      <LoadingBar color="#3b82f6" ref={loadingBar} shadow />

      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md space-y-2"
      >

      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Create account
      </h2>

        {/* Google Signup Button */}
        <button
          type="button"
          onClick={() =>
            (window.location.href = `${backendUrl}/api/auth/google?action=signup`)
          }
          className="w-full flex items-center justify-center gap-3 py-3 border border-blue-500 rounded-lg shadow-sm hover:shadow-md bg-white text-gray-700 font-medium hover:border-blue-600 hover:text-blue-600 transition-all"
        >
          {/* Google Logo */}
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google logo"
            className="w-5 h-5"
          />
          Sign up with Google
        </button>

      {/* Divider with OR */}
      <div className="flex items-center my-6">
        <hr className="flex-grow border-t border-gray-300" />
        <span className="mx-4 text-gray-500 font-medium">OR</span>
        <hr className="flex-grow border-t border-gray-300" />
      </div>



        {/* Full Name */}
        <div>
        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
            Name
        </label>
        <input
            id="name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
        />
        </div>

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
            className={`w-full px-4 py-3 rounded-lg shadow-sm border ${
              formData.email && !emailValid ? "border-red-400" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
            required
          />
          {!emailValid && formData.email && (
            <p className="mt-1 text-xs text-red-500">Enter a valid email.</p>
          )}
        </div>

        {/* Password */}
        <div>
        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
            Password
        </label>

        {/* Input + Eye button */}
        <div className="relative flex items-center">
            <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-12 leading-6"
            required
            />
            <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-3 h-6 w-6 flex items-center justify-center text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
            {showPassword ? (
                /* open-eye icon */
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.965 9.965 0 013.341-7.465M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18" />
                </svg>

            ) : (
                /* eye-off icon */
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            )}
            </button>
        </div>

        {/* Password strength bar */}
        <div className="mt-2 h-2 w-full bg-gray-200 rounded">
            <div className={`${strengthWidth} ${strengthColor} h-full rounded transition-all duration-300`} />
        </div>

        {/* Password strength label */}
        {formData.password && (
            <p className="mt-1 text-xs font-medium text-gray-600">{strengthLabel}</p>
        )}

        {/* Complexity hint */}
        <p className="mt-1 text-[11px] text-gray-500">
            4+ chars, 1 uppercase, 1 lowercase, 1 digit, 1 special
        </p>
        </div>


        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !emailValid || !formData.name.trim() || passwordStrength < 4}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Please wait…" : "Sign Up"}
        </button>


      {/* Divider*/}
      <div className="flex items-center my-8">
        <hr className="flex-grow border-t border-gray-300" />
        {/* <hr className="flex-grow border-t border-gray-300" /> */}
      </div>



        <p className="mt-4 text-sm text-center text-gray-600">
        Already have an account?{" "}
        <span
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:underline cursor-pointer font-medium"
        >
            Click here to Login
        </span>
        </p>

      </form>

      {/* Toasts */}
      <ToastContainer position="top-right" />
    </div>
  );
}
