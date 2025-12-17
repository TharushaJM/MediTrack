import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Mail, Calendar, User, Phone, MapPin, Briefcase, GraduationCap, Award, Shield, Camera, Save, Edit3, Lock, Eye, EyeOff, Clock, DollarSign, Loader2 } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function DoctorProfile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/api/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
      setUser(data);
      setForm(data);
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.put(`${API_URL}/api/users/profile`, form, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Profile updated successfully!");
      setUser(data.user);
      setForm(data.user);
      setEditing(false);
    } catch (error) {
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error("New passwords do not match"); return; }
    if (passwords.newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/users/profile`, passwords, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Password changed successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error("Incorrect current password or update failed");
    } finally {
      setSaving(false);
    }
  };

  const getProfileImage = () => {
    if (user?.profileImage) {
      if (user.profileImage.startsWith("http")) return user.profileImage;
      return `${API_URL}/${user.profileImage}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent((user?.firstName || "") + " " + (user?.lastName || ""))}&background=007BFF&color=fff&size=150`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-[#007BFF] animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "professional", label: "Professional", icon: Briefcase },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-950 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero Card */}
        <div className="relative bg-gradient-to-r from-[#007BFF] to-[#0056b3] dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white transform -translate-x-1/3 translate-y-1/3"></div>
          </div>
          <div className="relative p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full border-4 border-white/30 shadow-2xl overflow-hidden bg-gray-200">
                  <img src={getProfileImage()} alt={user.firstName} className="w-full h-full object-cover" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${user.firstName}&background=007BFF&color=fff&size=150`; }} />
                </div>
                <button className="absolute bottom-0 right-0 w-9 h-9 bg-white dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center text-[#007BFF] hover:scale-110 transition-transform"><Camera size={16} /></button>
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Dr. {user.firstName} {user.lastName}</h1>
                <p className="text-blue-100 dark:text-gray-400 flex items-center justify-center md:justify-start gap-2 mb-2"><Briefcase size={16} />{user.specialization || "General Physician"}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-blue-100 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Mail size={14} /> {user.email}</span>
                  {user.phone && <span className="flex items-center gap-1"><Phone size={14} /> {user.phone}</span>}
                  {user.experience && <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full"><Award size={12} /> {user.experience} yrs exp</span>}
                </div>
              </div>
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <button onClick={() => { setForm(user); setEditing(false); }} className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all font-medium">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-[#28A745] hover:bg-[#218838] text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium flex items-center gap-2">{saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}Save</button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} className="px-5 py-2.5 bg-white text-[#007BFF] hover:bg-blue-50 rounded-xl shadow-lg hover:shadow-xl transition-all font-medium flex items-center gap-2"><Edit3 size={18} />Edit Profile</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === tab.id ? "bg-[#007BFF] text-white shadow-md" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
              <tab.icon size={18} /><span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          {activeTab === "personal" && (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"><User size={20} className="text-[#007BFF]" /></div>
                <div><h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Personal Information</h2><p className="text-sm text-gray-500 dark:text-gray-400">Your basic details and contact info</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} disabled={!editing} icon={User} />
                <InputField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} disabled={!editing} icon={User} />
                <InputField label="Email Address" name="email" value={form.email} onChange={handleChange} disabled={true} icon={Mail} helper="Email cannot be changed" />
                <InputField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} disabled={!editing} icon={Phone} placeholder="+94 77 123 4567" />
                <InputField label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} disabled={!editing} icon={Calendar} />
                <SelectField label="Gender" name="gender" value={form.gender} onChange={handleChange} disabled={!editing} options={["Male", "Female", "Other"]} />
                <InputField label="City" name="city" value={form.city} onChange={handleChange} disabled={!editing} icon={MapPin} placeholder="Colombo" />
                <InputField label="Address" name="address" value={form.address} onChange={handleChange} disabled={!editing} icon={MapPin} placeholder="123 Main Street" />
              </div>
            </div>
          )}

          {activeTab === "professional" && (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"><Briefcase size={20} className="text-green-500" /></div>
                <div><h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Professional Details</h2><p className="text-sm text-gray-500 dark:text-gray-400">Your medical credentials and practice info</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SelectField label="Specialization" name="specialization" value={form.specialization} onChange={handleChange} disabled={!editing} options={["General Physician", "Cardiologist", "Dermatologist", "Neurologist", "Orthopedic", "Pediatrician", "Psychiatrist", "Gynecologist", "Ophthalmologist", "ENT Specialist"]} />
                <InputField label="Years of Experience" name="experience" type="number" value={form.experience} onChange={handleChange} disabled={!editing} icon={Award} placeholder="10" />
                <InputField label="Medical License No." name="licenseNumber" value={form.licenseNumber} onChange={handleChange} disabled={!editing} icon={GraduationCap} placeholder="SLMC-12345" />
                <InputField label="Hospital/Clinic" name="hospital" value={form.hospital} onChange={handleChange} disabled={!editing} icon={Briefcase} placeholder="National Hospital" />
                <InputField label="Consultation Fee (LKR)" name="consultationFee" type="number" value={form.consultationFee} onChange={handleChange} disabled={!editing} icon={DollarSign} placeholder="2500" />
                <InputField label="Available Hours" name="availableHours" value={form.availableHours} onChange={handleChange} disabled={!editing} icon={Clock} placeholder="9:00 AM - 5:00 PM" />
              </div>
              <div className="mt-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio / About</label>
                <textarea name="bio" value={form.bio || ""} onChange={handleChange} disabled={!editing} rows={4} placeholder="Brief description about your experience and expertise..." className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-[#007BFF] focus:border-transparent outline-none transition-all resize-none ${!editing ? "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""}`} />
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center"><Shield size={20} className="text-purple-500" /></div>
                <div><h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Security Settings</h2><p className="text-sm text-gray-500 dark:text-gray-400">Manage your password and account security</p></div>
              </div>
              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showCurrentPassword ? "text" : "password"} value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[#007BFF] focus:border-transparent outline-none transition-all" placeholder="Enter current password" />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={showNewPassword ? "text" : "password"} value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[#007BFF] focus:border-transparent outline-none transition-all" placeholder="Enter new password" />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={showConfirmPassword ? "text" : "password"} value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[#007BFF] focus:border-transparent outline-none transition-all" placeholder="Confirm new password" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                  </div>
                </div>
                {passwords.newPassword && (
                  <div className="space-y-2">
                    <div className="flex gap-1">{[1, 2, 3, 4].map((level) => (<div key={level} className={`h-1.5 flex-1 rounded-full transition-colors ${passwords.newPassword.length >= level * 3 ? level <= 2 ? "bg-red-400" : level === 3 ? "bg-yellow-400" : "bg-green-400" : "bg-gray-200 dark:bg-gray-600"}`} />))}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{passwords.newPassword.length < 6 ? "Weak - Add more characters" : passwords.newPassword.length < 10 ? "Medium - Consider adding numbers or symbols" : "Strong password"}</p>
                  </div>
                )}
                <div className="flex justify-end pt-4">
                  <button type="submit" disabled={saving || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword} className="px-6 py-3 bg-[#007BFF] hover:bg-[#0056b3] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium flex items-center gap-2">{saving ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}Update Password</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange, disabled, type = "text", icon: Icon, placeholder, helper }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <div className="relative">
        {Icon && <Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />}
        <input type={type} name={name} value={value || ""} onChange={onChange} disabled={disabled} placeholder={placeholder} className={`w-full ${Icon ? "pl-11" : "pl-4"} pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#007BFF] focus:border-transparent outline-none transition-all ${disabled ? "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""}`} />
      </div>
      {helper && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helper}</p>}
    </div>
  );
}

function SelectField({ label, name, value, onChange, disabled, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <select name={name} value={value || ""} onChange={onChange} disabled={disabled} className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[#007BFF] focus:border-transparent outline-none transition-all appearance-none cursor-pointer ${disabled ? "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""}`}>
        <option value="">Select {label}</option>
        {options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
      </select>
    </div>
  );
}
