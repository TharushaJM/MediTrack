import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
        setFormData({
          firstName: data.name?.split(" ")[0] || "",
          lastName: data.name?.split(" ")[1] || "",
          email: data.email || "",
          age: data.age || "",
          gender: data.gender || "Male",
          bloodType: data.bloodType || "O+",
          height: data.height || "",
          weight: data.weight || "",
        });
      } catch (err) {
        console.error("Error fetching user:", err);
        toast.error("Failed to load profile");
      }
    }

    fetchProfile();
  }, []);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/users/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profile updated successfully!");
      setUser((prev) => ({ ...prev, ...formData }));
      setEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
        <p className="text-gray-500">Manage your personal information</p>
      </div>

      {/* Top Card */}
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-semibold">
            {user.name?.charAt(0) || "U"}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {formData.firstName} {formData.lastName}
            </h2>
            <p className="text-gray-500 text-sm">{formData.email}</p>
            <div className="flex gap-4 text-sm text-gray-500 mt-1">
              <span>{formData.age || "—"} years</span>
              <span>•</span>
              <span>{formData.gender}</span>
            </div>
          </div>
        </div>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Edit Profile
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Personal Information</h3>
        <p className="text-sm text-gray-500">
          Your basic details and contact information
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              readOnly={!editing}
              className={`w-full border rounded p-2 ${
                editing ? "bg-white" : "bg-gray-100"
              }`}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              readOnly={!editing}
              className={`w-full border rounded p-2 ${
                editing ? "bg-white" : "bg-gray-100"
              }`}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              readOnly
              className="w-full border rounded p-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              readOnly={!editing}
              className={`w-full border rounded p-2 ${
                editing ? "bg-white" : "bg-gray-100"
              }`}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={!editing}
              className={`w-full border rounded p-2 ${
                editing ? "bg-white" : "bg-gray-100"
              }`}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Blood Type</label>
            <select
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              disabled={!editing}
              className={`w-full border rounded p-2 ${
                editing ? "bg-white" : "bg-gray-100"
              }`}
            >
              <option>O+</option>
              <option>A+</option>
              <option>B+</option>
              <option>AB+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Health Metrics</h3>
        <p className="text-sm text-gray-500">Your physical measurements</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Height (cm)</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              readOnly={!editing}
              className={`w-full border rounded p-2 ${
                editing ? "bg-white" : "bg-gray-100"
              }`}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              readOnly={!editing}
              className={`w-full border rounded p-2 ${
                editing ? "bg-white" : "bg-gray-100"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
