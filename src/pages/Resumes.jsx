import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import downloadIcon from './download.png';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const bar = useRef(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchResumes = async () => {
    try {
      bar.current.continuousStart();
      const token = localStorage.getItem("token");

      const res = await fetch(`${backendUrl}/api/resumes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setResumes(data);
    } catch (err) {
      toast.error("Failed to fetch resumes");
    } finally {
      bar.current.complete();
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes(); 

    const intervalId = setInterval(() => {
      fetchResumes(); 
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const confirmDelete = (id) => {
    setSelectedResumeId(id);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setSelectedResumeId(null);
    setShowDeleteModal(false);
  };

  const quotaLimit = 20; 
  const totalSize = resumes.reduce((sum, r) => sum + (r.sizeMB || 0), 0);
  const percent = Math.min((totalSize / quotaLimit) * 100, 100);
  const quotaBar = percent >= 75 ? "bg-red-500" : "bg-blue-600";  

  const handleDelete = async () => {
    if (!selectedResumeId) return;
    setIsDeleting(true)

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendUrl}/api/resumes/${selectedResumeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Document deleted");
        setResumes((prev) => prev.filter((r) => r._id !== selectedResumeId));
      } else if (res.status === 404) {
      toast.warn("Document not found. Refreshing...");
      await fetchResumes();   
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (err) {
      toast.error("Error deleting document");
    } finally {
      setIsDeleting(false);  
      setShowDeleteModal(false);
      setSelectedResumeId(null);
    }
  };

  return (
    <div className="bg-white min-h-screen p-4 sm:p-6">
      <LoadingBar color="#3b82f6" ref={bar} shadow />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Your Documents</h2>
          <Link
            to="/add"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md text-sm sm:text-base"
          >
            + Add Documents
          </Link>
        </div>


        <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden mb-1 relative">
          {/* Filled progress */}
          <div
            className={`h-full ${quotaBar}`}
            style={{ width: `${percent}%`, transition: 'width 0.4s ease-in-out' }}
          ></div>


          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`text-[11px] font-semibold ${
                percent > 15 ? "text-black" : "text-gray-800"
              }`}
            >
              {percent.toFixed(0)}%
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-600 mb-6">
          {totalSize.toFixed(2)} MB / 20 MB used
        </p>

        
        {loading ? (
          <p className="text-gray-600">Loading documents...</p>
        ) : resumes.length === 0 ? (
          <p className="text-gray-500 text-lg">No Documents found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-sm text-gray-700 font-semibold">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left">Name</th>
                  <th className="px-4 sm:px-6 py-3 text-right">Size (MB)</th>
                  <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800 text-sm">
                {resumes.map((resume) => (
                  <tr key={resume._id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 max-w-xs sm:max-w-md">
                      <span
                        className="block truncate"
                        title={resume.name || resume.filename}
                        style={{ maxWidth: '15rem' }}
                      >
                        {resume.name || resume.filename}
                      </span>
                    </td>

                    <td className="px-4 sm:px-6 py-3 text-right text-gray-600">
                      {resume.sizeMB ? `${resume.sizeMB} MB` : '—'}
                    </td>
                    
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <div className="inline-flex flex-wrap justify-end gap-2">
                        {/* Download Button */}
                        <a
                          href={resume.url.replace(
                            "/upload/",
                            `/upload/fl_attachment:${resume.filename}/`
                          )}
                          className="inline-block"
                          title="Download"
                          download={resume.filename}
                        >
                          <img src={downloadIcon} alt="Download" className="w-6 h-6" />
                        </a>

                        {/* View Button */}
                        <a
                          href={`${resume.url}?fl_attachment=false`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-1 rounded"
                        >
                          View
                        </a>

                        {/* Delete Button */}
                        <button
                          onClick={() => confirmDelete(resume._id)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`px-4 py-2 rounded text-white ${
                  isDeleting ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2200} />
    </div>
  );
}
