import { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Stethoscope,
  MapPin,
  Star,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function BookAppointment() {
  const [step, setStep] = useState(1); // 1: Select Doctor, 2: Select Date/Time, 3: Confirm
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  // Fetch approved doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/users/doctors/approved`);
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

  // Filter doctors based on search
  useEffect(() => {
    if (searchQuery) {
      const results = doctors.filter((doctor) =>
        `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.specialization || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDoctors(results);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [searchQuery, doctors]);

  // Fetch available slots when date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (selectedDoctor && selectedDate) {
        try {
          setSlotsLoading(true);
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `${API_URL}/api/appointments/available-slots?doctorId=${selectedDoctor._id}&date=${selectedDate}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setAvailableSlots(response.data.availableSlots);
          setBookedSlots(response.data.bookedSlots);
        } catch (error) {
          console.error("Error fetching slots:", error);
          toast.error("Failed to load available slots");
        } finally {
          setSlotsLoading(false);
        }
      }
    };
    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split("T")[0];
  };

  // Get profile image
  const getProfileImage = (doctor) => {
    if (doctor.profileImage) {
      if (doctor.profileImage.startsWith("http")) return doctor.profileImage;
      return `${API_URL}/${doctor.profileImage}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.firstName + " " + doctor.lastName)}&background=007BFF&color=fff&size=150`;
  };

  // Handle doctor selection
  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate("");
    setSelectedTime("");
    setStep(2);
  };

  // Handle booking
  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error("Please select all required fields");
      return;
    }

    try {
      setBooking(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/appointments/book`,
        {
          doctorId: selectedDoctor._id,
          date: selectedDate,
          timeSlot: selectedTime,
          reason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Appointment booked successfully!");
      setStep(3);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.error || "Failed to book appointment");
    } finally {
      setBooking(false);
    }
  };

  // Reset form
  const handleBookAnother = () => {
    setStep(1);
    setSelectedDoctor(null);
    setSelectedDate("");
    setSelectedTime("");
    setReason("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-950 dark:to-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Book an Appointment
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Schedule a visit with your preferred doctor
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= s
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step > s ? <CheckCircle size={20} /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded ${
                      step > s ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex justify-center gap-8 mb-8 text-sm">
          <span className={step >= 1 ? "text-blue-600 font-medium" : "text-gray-400"}>
            Select Doctor
          </span>
          <span className={step >= 2 ? "text-blue-600 font-medium" : "text-gray-400"}>
            Choose Date & Time
          </span>
          <span className={step >= 3 ? "text-blue-600 font-medium" : "text-gray-400"}>
            Confirmation
          </span>
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <div>
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search doctors by name or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Doctors Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-20">
                <Stethoscope className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No doctors found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    onClick={() => handleSelectDoctor(doctor)}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={getProfileImage(doctor)}
                        alt={doctor.firstName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 transition">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </h3>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {doctor.specialization || "General Physician"}
                        </p>
                        {doctor.location && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin size={12} /> {doctor.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {doctor.rating || "4.8"}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        Rs. {doctor.consultationFee || "500"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && selectedDoctor && (
          <div>
            {/* Back Button */}
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition"
            >
              <ChevronLeft size={20} />
              Back to doctors
            </button>

            {/* Selected Doctor Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm mb-8">
              <div className="flex items-center gap-4">
                <img
                  src={getProfileImage(selectedDoctor)}
                  alt={selectedDoctor.firstName}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400">
                    {selectedDoctor.specialization || "General Physician"}
                  </p>
                  {selectedDoctor.location && (
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin size={14} /> {selectedDoctor.location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Date Selection */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Select Date
                </h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime("");
                  }}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Time Slots */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Select Time
                </h3>

                {!selectedDate ? (
                  <p className="text-gray-400 text-center py-8">
                    Please select a date first
                  </p>
                ) : slotsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No slots available for this date
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                          selectedTime === slot
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Reason for Visit */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm mt-8">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Reason for Visit (Optional)
              </h3>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your symptoms or reason for the appointment..."
                rows={3}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Book Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleBookAppointment}
                disabled={!selectedDate || !selectedTime || booking}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition shadow-lg hover:shadow-xl"
              >
                {booking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-lg text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Appointment Booked!
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Your appointment has been successfully scheduled
              </p>

              {/* Appointment Details */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 text-left mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={getProfileImage(selectedDoctor)}
                    alt={selectedDoctor.firstName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {selectedDoctor.specialization}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">{selectedTime}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleBookAnother}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition"
                >
                  Book Another
                </button>
                <button
                  onClick={() => window.location.href = "/my-appointments"}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
                >
                  View Appointments
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
