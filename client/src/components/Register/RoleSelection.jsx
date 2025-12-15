import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Stethoscope, TrendingUp, ArrowRight } from "lucide-react";

export default function RoleSelection() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-blue-600 w-12 h-12 flex items-center justify-center rounded-xl font-bold text-white shadow-lg">
              M
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              <span className="text-blue-600">Medi</span>Track
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Choose how you want to register</p>
        </div>

        {/* Registration Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Patient Card */}
          <div
            onMouseEnter={() => setHoveredCard("patient")}
            onMouseLeave={() => setHoveredCard(null)}
            className="relative overflow-hidden bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={() => navigate("/register/patient")}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
            
            <div className="relative z-10">
              {/* Icon */}
              <div className="bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <Heart className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-2">
                Patient Registration
              </h2>

              {/* Stats */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl font-bold text-white">100K+</span>
                <div className="flex items-center gap-1 text-white/90 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+40%</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-white/90 mb-6 text-sm leading-relaxed">
                Track your health records, get AI-powered insights, set medication reminders, and manage your wellness journey.
              </p>

              {/* Button */}
              <div className="flex items-center justify-between">
                <button className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-all flex items-center gap-2 shadow-lg">
                  Register Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Doctor Card */}
          <div
            onMouseEnter={() => setHoveredCard("doctor")}
            onMouseLeave={() => setHoveredCard(null)}
            className="relative overflow-hidden bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={() => navigate("/register/doctor")}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
            
            <div className="relative z-10">
              {/* Icon */}
              <div className="bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-2">
                Doctor Registration
              </h2>

              {/* Stats */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl font-bold text-white">100+</span>
                <div className="flex items-center gap-1 text-white/90 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+16%</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-white/90 mb-6 text-sm leading-relaxed">
                Manage patients, schedule appointments, access medical records, and provide expert care through our platform.
              </p>

              {/* Button */}
              <div className="flex items-center justify-between">
                <button className="bg-white text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all flex items-center gap-2 shadow-lg">
                  Register Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-600 mb-2">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 font-semibold hover:underline"
            >
              Login here
            </button>
          </p>
          <p className="text-sm text-gray-500">
            Welcome to <span className="text-green-600 font-semibold">MediTrack</span>: Your Health, Our Priority
          </p>
        </div>
      </div>
    </div>
  );
}
