import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import oneImage from "../Landing/landing1.png"; // replace with your image

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      

      {/* HERO SECTION */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 md:px-20 py-16 md:py-24">
        {/* Left Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 space-y-6"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-900">
            Track your health.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Simplified.
            </span>
          </h1>

          <p className="text-lg text-gray-600 max-w-lg">
            Monitor sleep, mood, vitals, and more with MediTrack — your
            personal health companion for a better life.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg shadow hover:opacity-90 transition"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition"
            >
              Login
            </Link>
          </div>

          <div className="flex gap-6 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              🩺 <span>Track Daily</span>
            </div>
            <div className="flex items-center gap-2">
              🤖 <span>Stay Healthy</span>
            </div>
          </div>
        </motion.div>

        {/* Right Image */}
        <motion.img
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          src={oneImage}
          alt="Health illustration"
          className="md:w-1/2 w-full mt-10 md:mt-0 drop-shadow-2xl"
        />
      </section>

      {/* FEATURES SECTION */}
      <section className="bg-gray-50 py-20 px-6 md:px-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Everything you need for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              wellness
            </span>
          </h2>
          <p className="text-gray-600 mt-2">
            Comprehensive tools to help you stay on top of your health.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: "💤",
              title: "Sleep Tracking",
              desc: "Monitor your sleep patterns and get insights for better rest.",
            },
            {
              icon: "💧",
              title: "Hydration Goals",
              desc: "Track your water intake and stay hydrated throughout the day.",
            },
            {
              icon: "😊",
              title: "Mood Analysis",
              desc: "Record and analyze your daily mood patterns easily.",
            },
            {
              icon: "🩺",
              title: "Vital Signs",
              desc: "Keep track of BMI, weight, and other vital health metrics.",
            },
            {
              icon: "📄",
              title: "Health Records",
              desc: "Access your medical reports securely anytime, anywhere.",
            },
            {
              icon: "📊",
              title: "Visual Insights",
              desc: "View personalized health analytics and progress trends.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 flex flex-col items-start"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {f.title}
              </h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 bg-[#0b132b] text-gray-300 mt-auto">
        <p className="text-sm">
          © {new Date().getFullYear()}{" "}
          <span className="text-blue-400 font-semibold">MediTrack</span> — Your
          Personal Health Companion 💙
        </p>
      </footer>
    </div>
  );
}
