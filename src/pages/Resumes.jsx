import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const bar = useRef(null);

  const fetchResumes = async () => {
    try {
      bar.current.continuousStart();
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/resumes", {
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
  }, []);

  const confirmDelete = (id) => {
    setSelectedResumeId(id);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setSelectedResumeId(null);
    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (!selectedResumeId) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/resumes/${selectedResumeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Resume deleted");
        setResumes((prev) => prev.filter((r) => r._id !== selectedResumeId));
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (err) {
      toast.error("Error deleting resume");
    } finally {
      setShowDeleteModal(false);
      setSelectedResumeId(null);
    }
  };

  return (
    <div className="bg-white min-h-screen p-4 sm:p-6">
      <LoadingBar color="#3b82f6" ref={bar} shadow />
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Your Resumes</h2>
          <Link
            to="/add"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md text-sm sm:text-base"
          >
            + Add Resume
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading resumes...</p>
        ) : resumes.length === 0 ? (
          <p className="text-gray-500 text-lg">No resumes found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-sm text-gray-700 font-semibold">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left">Name</th>
                  <th className="px-4 sm:px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800 text-sm">
                {resumes.map((resume) => (
                  <tr key={resume._id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3">
                      {resume.name || resume.filename}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-center flex justify-center gap-2 flex-wrap">
                      <a
                        href={`${resume.url}?fl_attachment=false`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-1 rounded"
                      >
                        View
                      </a>
                      <button
                        onClick={() => confirmDelete(resume._id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-1 rounded"
                      >
                        Delete
                      </button>
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
              Are you sure you want to delete this resume? This action cannot be undone.
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
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2200} />
    </div>
  );
}
