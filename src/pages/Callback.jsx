import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Callback({ setToken }) {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    const name = params.get("name")

    if (token) {
      localStorage.setItem("token", token)
      localStorage.setItem("username", name?.split(" ")[0] || "")
      setToken(token)
      navigate("/resumes")
    } else {
      navigate("/login")
    }
  }, [navigate, setToken])

  return <p className="text-center mt-10">Signing you in...</p>
}
