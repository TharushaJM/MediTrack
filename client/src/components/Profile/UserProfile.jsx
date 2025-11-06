import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { User, Mail, UserCircle, Edit2 } from "lucide-react";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
        setForm({ name: data.name, email: data.email, password: "" });
      } catch (err) {
        console.error(err);
      }
    }
    fetchProfile();
  }, []);

  async function handleUpdate(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/users/profile", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return <div className="p-10 text-center">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faff] to-[#eef3ff] flex justify-center items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-xl rounded-2xl w-full max-w-lg p-8 relative border border-gray-100"
      >
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl"></div>

        <div className="flex flex-col items-center text-center mb-6">
          <UserCircle className="text-blue-600 w-16 h-16 mb-3" />
          <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
          <p className="text-gray-500 text-sm">
            Manage your personal details securely
          </p>
        </div>

        {!editing ? (
          <div className="space-y-4">
            <ProfileItem icon={<User />} label="Name" value={user.name} />
            <ProfileItem icon={<Mail />} label="Email" value={user.email} />
            <ProfileItem icon={<User />} label="Role" value={user.role} />

            <button
              onClick={() => setEditing(true)}
              className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              <Edit2 size={16} /> Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="border border-gray-300 w-full p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="border border-gray-300 w-full p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="New Password (optional)"
              className="border border-gray-300 w-full p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 border border-gray-400 text-gray-600 py-2 rounded hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

function ProfileItem({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between border-b pb-2">
      <div className="flex items-center gap-2 text-gray-600">
        <span className="text-blue-500">{icon}</span>
        <span className="font-medium">{label}:</span>
      </div>
      <span className="text-gray-800 font-semibold">{value}</span>
    </div>
  );
}
