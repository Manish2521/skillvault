import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import Home from './pages/Home'
import Resumes from './pages/Resumes'
import ResumeForm from './components/ResumeForm'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import EditResume from './pages/EditResume'
import Callback from "./pages/Callback"

export default function App() {
  const [token, setToken] = useState(null)


  useEffect(() => {
    const saved = localStorage.getItem('token')
    if (saved) setToken(saved)
  }, [])


  const PrivateRoute = ({ children }) =>
    token ? children : <Navigate to="/login" replace />

  const AuthRedirect = ({ children }) =>
    token ? <Navigate to="/resumes" replace /> : children

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar token={token} setToken={setToken} />

      <main className="flex-grow pt-20 pb-1 px-4 md:px-4">

        <Routes>

        <Route
          path="/edit/:id"
          element={
            <PrivateRoute>
              <EditResume />
            </PrivateRoute>
          }
        />

        <Route
          path="/"
          element={
            <AuthRedirect>
              <Home />
            </AuthRedirect>
          }
        />


          <Route
            path="/resumes"
            element={
              <PrivateRoute>
                <Resumes token={token} />
              </PrivateRoute>
            }
          />

          <Route
            path="/add"
            element={
              <PrivateRoute>
                <ResumeForm token={token} />
              </PrivateRoute>
            }
          />


          <Route
            path="/login"
            element={
              <AuthRedirect>
                <Login setToken={setToken} />
              </AuthRedirect>
            }
          />


          <Route path="/auth/callback" element={<Callback setToken={setToken} />} />

          
          <Route
            path="/signup"
            element={
              <AuthRedirect>
                <Signup />
              </AuthRedirect>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
