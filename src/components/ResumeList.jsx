import React from "react";
import { Link } from "react-router-dom";

const ResumeList = ({ resumes, onDelete, loading }) => {
  return (
    <div className="grid gap-4">
      {loading && (
        <div className="text-center text-blue-600 font-semibold">
          Loading resumes...
        </div>
      )}

      {!loading && resumes.length === 0 && (
        <div className="text-center text-gray-500">No resumes found.</div>
      )}

      {!loading &&
        resumes.map((resume) => (
          <div key={resume._id} className="p-4 border rounded shadow bg-white">
            <h3 className="text-xl font-semibold">{resume.filename}</h3>

            <div className="mt-2 flex gap-2">
              <a
                href={resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                View
              </a>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => onDelete(resume._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}


      {!loading && (
        <div className="mt-4 text-center">
          <Link
            to="/add"
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Add Resume
          </Link>
        </div>
      )}
    </div>
  );
};

export default ResumeList;
