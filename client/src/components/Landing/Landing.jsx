import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // 👈 install: npm install framer-motion
import oneImage from "../Landing/landing1.png"

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between p-10 md:p-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 space-y-6"
        >
          <h1 className="text-5xl font-extrabold text-gray-800">
            Manage Your Health, <span className="text-blue-600">Smarter.</span>
          </h1>
          <p className="text-lg text-gray-600">
            MediTrack helps patients and doctors track health data, monitor trends,
            and gain insights — all in one secure place.
          </p>
          <div className="flex gap-4">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="border border-blue-600 text-blue-600 px-5 py-2 rounded-lg hover:bg-blue-50 transition"
            >
              Login
            </Link>
          </div>
        </motion.div>

        {/* Image / Illustration */}
        <motion.img
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          src={oneImage}
          alt="Health illustration"
          className="md:w-1/2 w-full mt-10 md:mt-0"
        />
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
          Why Choose MediTrack?
        </h2>
        <div className="grid md:grid-cols-3 gap-10 px-6 md:px-20">
          {[
            { title: "Health Records", 
              desc: "Store and access your medical reports securely from anywhere.",
              img:"https://www.flaticon.com/free-icons/medical-checkup" ,
            
            },

            { title: "Doctor Insights", desc: "Share data with your doctor and get real-time feedback." },
            { title: "AI Assistance", desc: "Get personalized health advice powered by AI." },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="p-6 bg-gray-100 rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-2 text-blue-600">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 bg-gray-900 text-white mt-auto">
        <p>© {new Date().getFullYear()} MediTrack — Your Personal Health Companion 💙</p>
      </footer>
    </div>
  );
}
