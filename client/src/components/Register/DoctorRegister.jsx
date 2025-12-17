import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Check, User, Briefcase, MapPin } from "lucide-react";

export default function DoctorRegister() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    title: "",
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",

    // Step 2: Professional Details
    specialization: "",
    degree: "",
    registrationId: "",
    university: "",

    // Step 3: Contact & Location
    mobile: "",
    address: "",
    location: "",
    designation: "",
    lastWorkPlace: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.title || !formData.firstName || !formData.lastName || !formData.gender) {
        toast.error("Please fill all personal information fields");
        return false;
      }
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        toast.error("Please fill all email and password fields");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.specialization || !formData.degree || !formData.registrationId || !formData.university) {
        toast.error("Please fill all professional details");
        return false;
      }
    }

    if (currentStep === 3) {
      if (!formData.mobile || !formData.address || !formData.location) {
        toast.error("Please fill mobile, address, and location fields");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) return;

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: "doctor",
        // Additional doctor fields
        title: formData.title,
        gender: formData.gender,
        specialization: formData.specialization,
        degree: formData.degree,
        registrationId: formData.registrationId,
        university: formData.university,
        mobile: formData.mobile,
        address: formData.address,
        location: formData.location,
        designation: formData.designation,
        lastWorkPlace: formData.lastWorkPlace,
      };

      await axios.post("http://localhost:5000/api/users/register", payload);
      
      toast.success("Registration successful! Waiting for admin approval...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Professional", icon: Briefcase },
    { number: 3, title: "Contact & Location", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/choose-role")}
              className="flex items-center gap-2 text-white/90 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="text-sm">
              Step {currentStep} of 3
            </div>
          </div>
          <h1 className="text-3xl font-bold">Doctor Registration</h1>
          <p className="text-white/90 mt-1">Join our network of healthcare professionals</p>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-8 border-b">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              />
            </div>

            {/* Step Indicators */}
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? "bg-red-500 text-white"
                        : isActive
                        ? "bg-red-500 text-white ring-4 ring-red-200"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {isCompleted ? <Check className="w-6 h-6" /> : <StepIcon className="w-6 h-6" />}
                  </div>
                  <p
                    className={`mt-2 text-sm font-medium ${
                      isActive || isCompleted ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Personal Information</h2>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <select
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Title</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Miss">Miss</option>
                </select>
              </div>

              {/* Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="doctor@example.com"
                  required
                />
              </div>

              {/* Password Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Professional Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Professional Details</h2>

              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Cardiology, Orthopedics, Pediatrics"
                  required
                />
              </div>

              {/* Degree */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Degree <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., MBBS, MD, MS"
                  required
                />
              </div>

              {/* Registration ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medical Registration / License ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="registrationId"
                  value={formData.registrationId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., MCI-12345"
                  required
                />
              </div>

              {/* University */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University / Medical School <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Harvard Medical School"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 3: Contact & Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact & Location</h2>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Street address, City, State, ZIP"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital / Clinic Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., City General Hospital, New York"
                  required
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Senior Consultant"
                />
              </div>

              {/* Last Work Place */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Work Place
                </label>
                <input
                  type="text"
                  name="lastWorkPlace"
                  value={formData.lastWorkPlace}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Apollo Hospital"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-lg"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "Registering..." : "Complete Registration"}
                <Check className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-red-500 font-semibold hover:underline"
              >
                Login here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
