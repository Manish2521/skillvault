import { useEffect, useRef, useState } from "react";
import LoadingBar from "react-top-loading-bar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ResumeList from "../components/ResumeList";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// const currentTotal = resumes.reduce((s, r) => s + (r.sizeMB || 0), 0);
// const fileSizeMB   = +(file.size / (1024 * 1024)).toFixed(2);

export default function ResumeForm() {
  const [file, setFile] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const bar = useRef(null);
  const navigate = useNavigate();

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendUrl}/api/auth/resumes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) setResumes(data);
      else toast.error(data.message || "Failed to load documents.");
    } catch {
      toast.error("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchResumes();
  // }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file.");
    if (!resumeName.trim()) return toast.error("Please enter a resume name.");

    const currentTotal = resumes.reduce((s, r) => s + (r.sizeMB || 0), 0);
    const fileSizeMB   = +(file.size / (1024 * 1024)).toFixed(2);

    if (!file) return toast.error("Please select a file.");
    if (currentTotal + fileSizeMB > 20) {
      return toast.error("Quota exceeded (20 MB total). Delete something first.");
    }    

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("resumeName", resumeName.trim());

    try {
      setUploading(true);
      if (bar.current) bar.current.continuousStart();
      const token = localStorage.getItem("token");

      const res = await fetch(`${backendUrl}/api/resumes/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Resume uploaded!");
        setFile(null);
        setResumeName("");

        navigate("/resumes");
      } else {
        toast.error(data.message || "Upload failed.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      if (bar.current) bar.current.complete();
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`${backendUrl}/api/resumes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok && data.success) {
      toast.success("Resume deleted");
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } else {
      toast.error(data.message || "Delete failed");
    }
  };

  return (
    <div className="bg-gray-100 px-4 py-6 min-h-screen">
      <LoadingBar color="#3b82f6" ref={bar} shadow />
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto mb-8">
        <h2 className="text-2xl font-semibold mb-6">Upload Your Documents</h2>

        <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="text"
          placeholder="Title (e.g. Frontend Dev)"
          value={resumeName}
          onChange={(e) => {
            if (e.target.value.length <= 20) {
              setResumeName(e.target.value);
            }
          }}
          maxLength={20}
          required
          className="w-full border px-3 py-2 rounded"
        />
        <p className="text-sm text-gray-500 text-right">
          {resumeName.length}/20 characters
        </p>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const selectedFile = e.target.files[0];
              if (selectedFile) {
                if (selectedFile.type !== "application/pdf") {
                  toast.error("Please select a PDF file.");
                  e.target.value = null;
                  setFile(null);
                } else if (selectedFile.size > 4 * 1024 * 1024) {
                  toast.error("PDF must be under 4MB.");
                  e.target.value = null;
                  setFile(null);
                } else {
                  setFile(selectedFile);
                }
              }

            }}
            required
            className="w-full"
          />


          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-2 rounded text-white transition ${
              uploading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {uploading ? "Uploading…" : "Upload Documents"}
          </button>
        </form>
      </div>

      {/* <div className="max-w-3xl mx-auto">
        <h3 className="text-xl font-bold mb-4">Your Documents</h3>
        <ResumeList resumes={resumes} onDelete={handleDelete} loading={loading} />
      </div> */}

      <ToastContainer position="top-right" autoClose={2200} />
    </div>
  );
}
