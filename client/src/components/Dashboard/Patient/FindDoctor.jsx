import { useState, useEffect } from "react";
import { Search, Star, MapPin, Clock, Filter, ChevronDown, Stethoscope, Heart, Brain, Bone, Eye, Baby, Smile, Activity, Loader2, GraduationCap } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const specializations = [
  { name: "All Specializations", icon: Activity },
  { name: "Cardiologist", icon: Heart },
  { name: "Neurologist", icon: Brain },
  { name: "Orthopedic", icon: Bone },
  { name: "Ophthalmologist", icon: Eye },
  { name: "Pediatrician", icon: Baby },
  { name: "Dermatologist", icon: Smile },
  { name: "Psychiatrist", icon: Brain },
  { name: "General Physician", icon: Stethoscope }
];

export default function FindDoctor() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specializations");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL + "/api/users/doctors/approved");
        setDoctors(response.data);
        setFilteredDoctors(response.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    let results = doctors;
    if (searchQuery) {
      results = results.filter((doctor) =>
        (doctor.firstName + " " + doctor.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.specialization || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.location || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedSpecialization !== "All Specializations") {
      results = results.filter((doctor) => doctor.specialization === selectedSpecialization);
    }
    setFilteredDoctors(results);
  }, [searchQuery, selectedSpecialization, doctors]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 4.5);
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />);
    }
    return stars;
  };

  const getProfileImage = (doctor) => {
    if (doctor.profileImage) {
      if (doctor.profileImage.startsWith("http")) return doctor.profileImage;
      return API_URL + "/" + doctor.profileImage;
    }
    return "https://ui-avatars.com/api/?name=" + encodeURIComponent(doctor.firstName + " " + doctor.lastName) + "&background=007BFF&color=fff&size=150";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-950 dark:to-gray-900">
      <div className="relative bg-gradient-to-r from-[#007BFF] to-[#0056b3] dark:from-gray-900 dark:to-gray-800 pb-32">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white"></div>
          <div className="absolute top-20 right-20 w-48 h-48 rounded-full bg-white"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Find Your Perfect Doctor</h1>
            <p className="text-blue-100 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Search from our network of qualified healthcare professionals
            </p>
          </div>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-[#007BFF] outline-none text-gray-800 dark:text-gray-200"
                />
              </div>
              <div className="relative min-w-[220px]">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full flex items-center justify-between px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <div className="flex items-center gap-2">
                    <Filter size={18} className="text-[#007BFF]" />
                    <span className="font-medium truncate">{selectedSpecialization}</span>
                  </div>
                  <ChevronDown size={18} className={isDropdownOpen ? "rotate-180" : ""} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[9999] w-[280px] max-h-[400px] overflow-y-auto">
                    {specializations.map((spec) => (
                      <button key={spec.name} onClick={() => { setSelectedSpecialization(spec.name); setIsDropdownOpen(false); }}
                        className={"w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 text-left transition-colors " + (selectedSpecialization === spec.name ? "bg-blue-50 dark:bg-gray-700 text-[#007BFF]" : "text-gray-700 dark:text-gray-300")}>
                        <spec.icon size={18} /><span>{spec.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="px-8 py-4 bg-[#28A745] hover:bg-[#218838] text-white font-semibold rounded-xl">Search</button>
            </div>
          </div>
          <div className="flex justify-center gap-8 mt-8 text-white/90">
            <div className="text-center"><div className="text-2xl font-bold">{doctors.length}+</div><div className="text-sm text-blue-100">Verified Doctors</div></div>
            <div className="text-center"><div className="text-2xl font-bold">8+</div><div className="text-sm text-blue-100">Specializations</div></div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{loading ? "Loading..." : filteredDoctors.length + " Doctors Found"}</h2>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={48} className="text-[#007BFF] animate-spin mb-4" />
            <p className="text-gray-500">Loading doctors...</p>
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:-translate-y-1"
              >
                {/* Card Header with Gradient */}
                <div className="h-20 bg-gradient-to-r from-[#007BFF] to-[#0056b3] dark:from-gray-700 dark:to-gray-600 relative">
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                    <div className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden bg-gray-200">
                      <img
                        src={getProfileImage(doctor)}
                        alt={doctor.firstName + " " + doctor.lastName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(doctor.firstName + " " + doctor.lastName) + "&background=007BFF&color=fff&size=150";
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="pt-12 pb-5 px-5">
                  {/* Doctor Info */}
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
                      {doctor.title || "Dr."} {doctor.firstName} {doctor.lastName}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-[#007BFF] dark:text-blue-400 text-sm font-medium rounded-full">
                      {doctor.specialization || "General Physician"}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <div className="flex items-center gap-0.5">
                      {renderStars(4.5)}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                      4.5
                    </span>
                    <span className="text-sm text-gray-400">
                      (100+ reviews)
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-5">
                    {doctor.degree && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <GraduationCap size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{doctor.degree}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{doctor.location || doctor.lastWorkPlace || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} className="text-[#28A745] flex-shrink-0" />
                      <span className="text-[#28A745] font-medium">
                        Available Today
                      </span>
                    </div>
                  </div>

                  {/* Book Button */}
                  <button 
                    onClick={() => toast.success("Booking with " + (doctor.title || "Dr.") + " " + doctor.firstName + " " + doctor.lastName)}
                    className="w-full py-3 bg-[#28A745] hover:bg-[#218838] text-white font-semibold rounded-xl transition-all hover:shadow-lg group-hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Stethoscope size={40} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Doctors Found</h3>
            <button onClick={() => { setSearchQuery(""); setSelectedSpecialization("All Specializations"); }} className="mt-4 px-6 py-2 text-[#007BFF] hover:bg-blue-50 rounded-lg">Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
