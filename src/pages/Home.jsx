import { Link } from 'react-router-dom';

export default function Home() {

  // useEffect(() => {
  //   setToken(token)
  //   api.get('/resumes').then(({ data }) => setResumes(data))
  // }, [token])

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-6 text-center">

      <div className="bg-blue-600 text-white p-4 rounded-full shadow-lg mb-8 animate-bounce">

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-3-3v6m-8 4h14a2 2 0 002-2V9a2 2 0 00-2-2h-3V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v2H5a2 2 0 00-2 2v9a2 2 0 002 2z"
          />
        </svg>
      </div>


      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 max-w-2xl mb-4 leading-tight">
        Securely Store &amp; Manage Your <span className="text-blue-600">Document</span> in One Place

      </h1>


      <p className="text-gray-600 max-w-xl mb-8 text-lg md:text-xl">
        SkillVault lets you securely upload, organize, and access your Document anytime, anywhere. Join now and take control of your career documents.
      </p>


      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow transition"
        >
          Log In
        </Link>
        <Link
          to="/signup"
          className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg shadow transition"
        >
          Sign Up
        </Link>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute -top-20 -left-20 w-80 opacity-20" viewBox="0 0 91 91" fill="none">
          <circle cx="45.5" cy="45.5" r="45.5" fill="#6366F1" />
        </svg>
        <svg className="absolute bottom-10 -right-16 w-64 opacity-10" viewBox="0 0 100 100" fill="none">
          <rect width="100" height="100" rx="20" fill="#EC4899" />
        </svg>
      </div>
    </section>
  );
}
