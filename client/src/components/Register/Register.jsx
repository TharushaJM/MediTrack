import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ 
    firstName: "",
    lastName: "", 
    email: "", 
    password: "", 
    role: "patient",
    specialization: "",
    licenseNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/users/register", form);
      
      // Check if it's a doctor registration (no token returned)
      if (form.role === "doctor") {
        alert(response.data.message || "Doctor registration successful! Your account is pending admin approval. You will be able to login once approved.");
        navigate("/login");
      } else {
        // Patient registration - auto login
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        alert("Registration successful! Please log in.");
        navigate("/login");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error registering user";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 w-96">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Register</h2>
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="First Name"
            className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.firstNam}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required
          />
           <input
            type="text"
            placeholder="Last Name"
            className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <select
            className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>

          {/* Doctor-specific fields */}
          {form.role === "doctor" && (
            <>
              <input
                type="text"
                placeholder="Specialization (e.g., Cardiologist, General Physician)"
                className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="License Number"
                className="border p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                required
              />
            </>
          )}

          <button
            type="submit"
            className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
