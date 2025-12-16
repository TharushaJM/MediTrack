import { useState, useEffect } from "react";
import { Search, Star, MapPin, Clock, Filter, ChevronDown, Stethoscope, Heart, Brain, Bone, Eye, Baby, Smile, Activity } from "lucide-react";

// Sample doctor data - replace with API call
const sampleDoctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialization: "Cardiologist",
    rating: 4.9,
    reviews: 127,
    experience: "15 years",
    location: "New York Medical Center",
    availability: "Available Today",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    nextSlot: "10:30 AM"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialization: "Neurologist",
    rating: 4.8,
    reviews: 98,
    experience: "12 years",
    location: "City Health Hospital",
    availability: "Available Tomorrow",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    nextSlot: "9:00 AM"
  },
  {
    id: 3,
    name: "Dr. Emily Williams",
    specialization: "Dermatologist",
    rating: 4.7,
    reviews: 156,
    experience: "10 years",
    location: "Skin Care Clinic",
    availability: "Available Today",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face",
    nextSlot: "2:00 PM"
  },
  {
    id: 4,
    name: "Dr. James Anderson",
    specialization: "Orthopedic",
    rating: 4.9,
    reviews: 203,
    experience: "18 years",
    location: "Bone & Joint Center",
    availability: "Available Today",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
    nextSlot: "11:00 AM"
  },
  {
    id: 5,
    name: "Dr. Lisa Thompson",
    specialization: "Pediatrician",
    rating: 4.8,
    reviews: 189,
    experience: "14 years",
    location: "Children's Health Center",
    availability: "Available Tomorrow",
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=150&h=150&fit=crop&crop=face",
    nextSlot: "10:00 AM"
  },
  {
    id: 6,
    name: "Dr. Robert Martinez",
    specialization: "Ophthalmologist",
    rating: 4.6,
    reviews: 112,
    experience: "11 years",
    location: "Vision Care Institute",
    availability: "Available Today",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face",
    nextSlot: "3:30 PM"
  },
  {
    id: 7,
    name: "Dr. Amanda Foster",
    specialization: "Psychiatrist",
    rating: 4.9,
    reviews: 87,
    experience: "9 years",
    location: "Mental Wellness Center",
    availability: "Available Today",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=150&h=150&fit=crop&crop=face",
    nextSlot: "4:00 PM"
  },
  {
    id: 8,
    name: "Dr. David Kim",
    specialization: "General Physician",
    rating: 4.7,
    reviews: 245,
    experience: "20 years",
    location: "Family Health Clinic",
    availability: "Available Today",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
    nextSlot: "1:00 PM"
  }
];

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
  const [filteredDoctors, setFilteredDoctors] = useState(sampleDoctors);

  useEffect(() => {
    let results = sampleDoctors;

    // Filter by search query
    if (searchQuery) {
      results = results.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by specialization
    if (selectedSpecialization !== "All Specializations") {
      results = results.filter(
        (doctor) => doctor.specialization === selectedSpecialization
      );
    }

    setFilteredDoctors(results);
  }, [searchQuery, selectedSpecialization]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Star key="half" size={14} className="fill-yellow-400/50 text-yellow-400" />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#007BFF] to-[#0056b3] dark:from-gray-900 dark:to-gray-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white"></div>
          <div className="absolute top-20 right-20 w-48 h-48 rounded-full bg-white"></div>
          <div className="absolute bottom-10 left-1/3 w-24 h-24 rounded-full bg-white"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-12">
          {/* Hero Content */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Find Your Perfect Doctor
            </h1>
            <p className="text-blue-100 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Search from our network of qualified healthcare professionals and book your appointment today
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search doctors, specializations, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-[#007BFF] dark:focus:ring-blue-500 outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                />
              </div>

              {/* Specialization Dropdown */}
              <div className="relative min-w-[220px]">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all text-gray-700 dark:text-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <Filter size={18} className="text-[#007BFF] dark:text-blue-400" />
                    <span className="font-medium truncate">{selectedSpecialization}</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                    {specializations.map((spec) => (
                      <button
                        key={spec.name}
                        onClick={() => {
                          setSelectedSpecialization(spec.name);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-left ${
                          selectedSpecialization === spec.name
                            ? "bg-blue-50 dark:bg-gray-700 text-[#007BFF] dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <spec.icon size={18} />
                        <span>{spec.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button className="px-8 py-4 bg-[#28A745] hover:bg-[#218838] text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                Search
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex justify-center gap-8 mt-8 text-white/90">
            <div className="text-center">
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-blue-100 dark:text-gray-400">Verified Doctors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">50+</div>
              <div className="text-sm text-blue-100 dark:text-gray-400">Specializations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">10k+</div>
              <div className="text-sm text-blue-100 dark:text-gray-400">Happy Patients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Doctor Cards Grid */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {filteredDoctors.length} Doctors Found
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {selectedSpecialization !== "All Specializations"
                ? `Showing ${selectedSpecialization}s`
                : "Showing all specializations"}
            </p>
          </div>
        </div>

        {/* Doctor Cards Grid */}
        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:-translate-y-1"
              >
                {/* Card Header with Gradient */}
                <div className="h-20 bg-gradient-to-r from-[#007BFF] to-[#0056b3] dark:from-gray-700 dark:to-gray-600 relative">
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                    <div className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden bg-gray-200">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=007BFF&color=fff&size=150`;
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
                      {doctor.name}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-[#007BFF] dark:text-blue-400 text-sm font-medium rounded-full">
                      {doctor.specialization}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <div className="flex items-center gap-0.5">
                      {renderStars(doctor.rating)}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                      {doctor.rating}
                    </span>
                    <span className="text-sm text-gray-400">
                      ({doctor.reviews} reviews)
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="truncate">{doctor.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} className="text-[#28A745]" />
                      <span className="text-[#28A745] font-medium">
                        {doctor.availability} • {doctor.nextSlot}
                      </span>
                    </div>
                  </div>

                  {/* Book Button */}
                  <button className="w-full py-3 bg-[#28A745] hover:bg-[#218838] text-white font-semibold rounded-xl transition-all hover:shadow-lg group-hover:scale-[1.02] active:scale-[0.98]">
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Doctors Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              We couldn't find any doctors matching your search criteria. Try adjusting your filters or search query.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedSpecialization("All Specializations");
              }}
              className="mt-4 px-6 py-2 text-[#007BFF] hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
