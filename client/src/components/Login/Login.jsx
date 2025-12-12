import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
  e.preventDefault();
  setLoading(true);

  try {
    const { data } = await axios.post(
      "http://localhost:5000/api/users/login",
      { email, password }
    );

    //  Save token
    localStorage.setItem("token", data.token);

    //  Save full user info, including role & isApproved
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        name: `${data.user.firstName} ${data.user.lastName}`,
        email: data.user.email,
        role: data.user.role,
        isApproved: data.user.isApproved,
        specialization: data.user.specialization,
        licenseNumber: data.user.licenseNumber,
      })
    );

    //  Keep backward-compat for Dashboard.jsx
    localStorage.setItem("role", data.user.role);

    alert("Login successful!");

    //  Redirect based on role
    if (data.user.role === "admin") {
      navigate("/admin", { replace: true });
    } else if (data.user.role === "doctor") {
      navigate("/doctor-dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  } catch (err) {
    console.error(err);
    const errorMsg = err.response?.data?.message || "Invalid email or password";
    alert(errorMsg);
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-gray-600">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
