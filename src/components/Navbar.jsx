import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaFileAlt, FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa'
import ThemeToggle from './ThemeToggle'
import { User } from 'lucide-react' 
import { HiOutlineDocumentText } from "react-icons/hi";
import { FaVault } from "react-icons/fa6";

export default function Navbar({ token, setToken }) {
  const [userName, setUserName] = useState(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const navigate = useNavigate()

  // Load username on mount or when token changes
  useEffect(() => {
    const savedName = localStorage.getItem('username')
    if (token && savedName) {
      setUserName(savedName)
    } else {
      setUserName(null)
    }
  }, [token])

  // Open logout modal
  const confirmLogout = () => {
    setShowLogoutModal(true)
  }

  // Confirm logout: clear storage and state, redirect home
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken(null)
    setUserName(null)
    setShowLogoutModal(false)
    navigate('/')
  }

  // Cancel logout modal
  const cancelLogout = () => {
    setShowLogoutModal(false)
  }

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center space-x-2">
          <FaVault className="text-blue-600 text-3xl" />
          <span className="text-2xl font-extrabold text-gray-800 dark:text-white">
            SkillVault
          </span>
        </Link>


          <div className="flex items-center md:order-2 space-x-4 rtl:space-x-reverse">
            {/* <ThemeToggle /> */}

            {token && userName ? (
              <>
              
              <span className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 font-medium px-1 py-2 rounded-xl shadow-sm">
{/*                 <User className="w-5 h-5 text-blue-600 dark:text-blue-400" /> */}
                Hello, <span className="font-semibold text-blue-600 dark:text-blue-400">{userName.split(' ')[0]}</span>
              </span>

                <button
                  onClick={confirmLogout}
                  className="flex items-center gap-1 text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none 
                  focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-3 text-center 
                  dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-800"
                >
                  <FaSignOutAlt />
                  
                </button>
              </>
            ) : (
              <>
              <Link
                to="/login"
                className="flex items-center gap-2 px-2 py-1.5 border border-blue-500 text-blue-600 font-medium rounded-lg shadow-sm hover:shadow-md hover:bg-blue-50 transition-all"
              >
                <FaSignInAlt className="text-blue-500" />
                Login
              </Link>

              <Link
                to="/signup"
                className="flex items-center gap-2 px-2 py-1.5 border border-green-500 text-green-600 font-medium rounded-lg shadow-sm hover:shadow-md hover:bg-green-50 transition-all"
              >
                <FaUserPlus className="text-green-500" />
                Signup
              </Link>
              </>
            )}
          </div>

          <div
            className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
            id="navbar-sticky"
          >
            <ul
              className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg 
              bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white 
              dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700"
            >
              <li>
                <Link
                  to="/"
                  className="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500"
                >
                  Home
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Logout
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
