import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Mail, Calendar, Venus } from "lucide-react";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ✅ Fetch user profile from backend
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data);
      setForm(data); // pre-fill form with live data
    } catch {
      toast.error("Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ✅ Handle live typing
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Save and reflect immediately (no refresh)
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put("http://localhost:5000/api/users/profile", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Profile updated successfully!");
      setUser(data.user); // update UI immediately
      setForm(data.user);
      setEditing(false);
    } catch (error) {
      console.error(error);
      toast.error("Error updating profile");
    }
  };

  // ✅ Password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/users/profile", passwords, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Password changed successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error("Incorrect current password or update failed");
    }
  };

  if (!user) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading...</div>;

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Profile</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Manage your personal information</p>

      {/* --- Profile Header --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xl font-bold">
            {user.firstName?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="font-semibold text-lg">{`${user.firstName || ""} ${user.lastName || ""}`}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
              <Mail size={14} /> {user.email}
            </p>
            <div className="flex gap-4 text-gray-500 dark:text-gray-400 text-sm mt-1">
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {user.age || "--"} years
              </span>
              <span className="flex items-center gap-1">
                <Venus size={14} /> {user.gender || "--"}
              </span>
            </div>
          </div>
        </div>

        {editing ? (
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 
              text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl 
              transition-all duration-200 font-medium"
          >
            Save Changes
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 
              text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl 
              transition-all duration-200 font-medium"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* --- Personal Information --- */}
      <Card title="Personal Information" subtitle="Your basic details and contact information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} disabled={!editing} />
          <InputField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} disabled={!editing} />
          <InputField label="Email" name="email" value={form.email} onChange={handleChange} disabled />
          <InputField label="Age" name="age" type="number" value={form.age} onChange={handleChange} disabled={!editing} />
          <Dropdown label="Gender" name="gender" value={form.gender} options={["Male", "Female", "Other"]} onChange={handleChange} disabled={!editing} />
          <Dropdown label="Blood Type" name="bloodType" value={form.bloodType} options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]} onChange={handleChange} disabled={!editing} />
        </div>
      </Card>

      {/* --- Health Metrics --- */}
      <Card title="Health Metrics" subtitle="Your physical measurements">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Height (cm)" name="height" type="number" value={form.height} onChange={handleChange} disabled={!editing} />
          <InputField label="Weight (kg)" name="weight" type="number" value={form.weight} onChange={handleChange} disabled={!editing} />
        </div>
      </Card>

      {/* --- Change Password --- */}
      <Card title="Change Password" subtitle="Update your account password">
        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField
            label="Current Password"
            name="currentPassword"
            type="password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
          />
          <InputField
            label="New Password"
            name="newPassword"
            type="password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
          />
          <InputField
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
          />
          <div className="col-span-full flex justify-end mt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 
                text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl 
                transition-all duration-200 font-medium"
            >
              Update Password
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// === Reusable Components ===
function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <h2 className="font-semibold text-lg mb-1 text-gray-800 dark:text-gray-100">{title}</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{subtitle}</p>
      {children}
    </div>
  );
}

function InputField({ label, name, value, onChange, disabled, type = "text" }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1 font-medium">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 
          bg-white dark:bg-gray-700 
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
          focus:border-transparent outline-none
          transition-colors
          ${disabled ? "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""}`}
      />
    </div>
  );
}

function Dropdown({ label, name, value, onChange, disabled, options }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1 font-medium">{label}</label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 
          bg-white dark:bg-gray-700 
          text-gray-900 dark:text-gray-100
          focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
          focus:border-transparent outline-none
          transition-colors"
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
