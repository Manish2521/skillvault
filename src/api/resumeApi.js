
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const API_BASE = `${backendUrl}/api/auth/resumes`;

export const getResumes = async () => {
  const res = await fetch(API_BASE);
  return res.json();
};

export const createResume = async (data) => {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateResume = async (id, data) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteResume = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  return res.json();
};
