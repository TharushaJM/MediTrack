import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  FileText,
  Bell,
  Stethoscope,
  CalendarCheck,
  MessageSquare,
  ShieldCheck,
  Activity,
  ArrowRight,
} from "lucide-react";

import heroImg from "./hero-illustration.png";
import ctaImg from "./cta-illustration.png";

export default function Landing() {
  const patientFeatures = [
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Daily Wellness Tracking",
      desc: "Track mood, sleep, water, BMI and habits with a clean check-in experience.",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Reports Vault (PDF / Images)",
      desc: "Upload medical reports and keep them organized. OCR helps extract text for quick viewing.",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Health Assistant",
      desc: "Get helpful guidance and summaries based on your wellness journey (safe, supportive insights).",
    },
  ];

  const doctorFeatures = [
    {
      icon: <CalendarCheck className="w-6 h-6" />,
      title: "Appointments Management",
      desc: "View appointments, confirm/cancel/complete, and stay on top of your schedule.",
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Doctor Notifications",
      desc: "Get real-time style cues (badge/dropdown) for appointment requests and updates.",
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Doctor–Patient Chat",
      desc: "Chat with patients who have appointments and keep communication in one place.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top Nav */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-xl">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center">
              M
            </div>
            <span>MediTrack</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900">
              Features
            </a>
            <a href="#how" className="hover:text-gray-900">
              How it works
            </a>
            <a href="#trust" className="hover:text-gray-900">
              Trust
            </a>
            <a href="#contact" className="hover:text-gray-900">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm border border-gray-200 hover:bg-gray-50 transition"
            >
              Login
            </Link>
            <Link
              to="/choose-role"
              className="px-4 py-2 rounded-xl text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 transition shadow"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(147,51,234,0.12),transparent_60%)]" />
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-100 bg-blue-50 text-blue-700 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                Secure health tracking for Patients & Doctors
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                Track your health.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Stay organized. Get care faster.
                </span>
              </h1>

              <p className="text-gray-600 text-lg max-w-xl">
                MediTrack helps patients track wellness and keep reports in one
                place — while doctors manage appointments, notifications, and
                patient chats smoothly.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/choose-role"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl shadow hover:opacity-95 transition font-medium"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-gray-200 hover:bg-gray-50 transition font-medium"
                >
                  Login
                </Link>
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-gray-500 pt-2">
                <div className="flex items-center gap-2">
                  🩺 <span>Appointments</span>
                </div>
                <div className="flex items-center gap-2">
                  📄 <span>Reports Vault</span>
                </div>
                <div className="flex items-center gap-2">
                  💬 <span>Chat + Notifications</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-blue-200/40 to-purple-200/40 blur-2xl" />
              <img
                src={heroImg}
                alt="MediTrack hero illustration"
                className="relative w-full rounded-3xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Everything you need for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                wellness & care
              </span>
            </h2>
            <p className="text-gray-600 mt-3">
              Built around what your project actually does today — no fake
              promises.
            </p>
          </div>

          {/* Patient Features */}
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-semibold">
              <Activity className="w-4 h-4" />
              Patient
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {patientFeatures.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-100 flex items-center justify-center text-blue-700">
                  {f.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Doctor Features */}
          <div className="flex items-center gap-2 mt-12 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">
              <Stethoscope className="w-4 h-4" />
              Doctor
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctorFeatures.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-100 flex items-center justify-center text-purple-700">
                  {f.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 bg-[#F6FAFF]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700">
              HOW IT WORKS
            </div>

            <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
              Get Started in{" "}
              <span className="relative inline-block">
                minutes
                <span className="absolute -z-10 left-0 right-0 bottom-2 h-4 rounded-md bg-gradient-to-r from-blue-400/70 to-purple-400/70" />
              </span>
            </h2>

            <p className="mt-3 text-slate-600 text-lg">
              From signup to seamless health management in minutes.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute left-8 right-8 top-[58px] h-[2px] bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200" />

            <div className="grid gap-6 lg:grid-cols-4">
              <StepCard
                step="01"
                title="Create Your Account"
                desc="Sign up in seconds. Choose your role as a patient or doctor."
                icon={<Activity className="w-6 h-6" />}
                delay={0}
              />
              <StepCard
                step="02"
                title="Set Up Your Profile"
                desc="Add your health info and preferences to personalize the experience."
                icon={<FileText className="w-6 h-6" />}
                delay={0.05}
              />
              <StepCard
                step="03"
                title="Start Tracking"
                desc="Log wellness metrics, upload reports, and stay consistent."
                icon={<CalendarCheck className="w-6 h-6" />}
                delay={0.1}
              />
              <StepCard
                step="04"
                title="Stay Connected"
                desc="Book appointments, chat, and get updates when it matters."
                icon={<MessageSquare className="w-6 h-6" />}
                delay={0.15}
              />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section id="trust" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-extrabold">
                Trust-first by design
              </h2>
              <p className="text-gray-600">
                Health data needs care. Your project already uses authentication
                and protected routes. Next, you can add stronger consent
                controls and audit logs.
              </p>

              <div className="space-y-3">
                <TrustItem
                  title="Protected Routes"
                  desc="Doctor-only and Patient-only dashboards via role-based protection."
                />
                <TrustItem
                  title="Private Reports"
                  desc="Reports are stored per-user (patient). Sharing can be added as a controlled feature."
                />
                <TrustItem
                  title="Notifications & Updates"
                  desc="Badge cues help doctors respond quickly to appointment activity."
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-start gap-4">
                {/* icon */}
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>

                {/* title + subtitle */}
                <div>
                  <p className="text-lg font-extrabold text-slate-900">
                    Simple model, strong foundation
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    The UI stays calm while the system stays strict.
                  </p>
                </div>
              </div>

              {/* two mini cards */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="font-extrabold text-slate-900">Patients</p>
                  <p className="text-slate-500 mt-1">
                    Track <span className="mx-1">•</span> Store{" "}
                    <span className="mx-1">•</span> Remind
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="font-extrabold text-slate-900">Doctors</p>
                  <p className="text-slate-500 mt-1">
                    Schedule <span className="mx-1">•</span> Update{" "}
                    <span className="mx-1">•</span> Chat
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20 bg-[#F6FAFF]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-extrabold tracking-wide text-slate-700">
                CONTACT US
              </div>

              <h2 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05] text-slate-900">
                Let&apos;s Start a{" "}
                <span className="relative inline-block">
                  conversation
                  <span className="absolute -z-10 left-0 right-0 bottom-2 h-4 rounded-md bg-gradient-to-r from-blue-400/70 to-purple-400/70" />
                </span>
              </h2>

              <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-xl">
                Have questions about MediTrack? We’re here to help. Reach out
                and we’ll get back to you within 24 hours.
              </p>

              <div className="mt-10 space-y-5">
                <ContactInfo
                  label="Email"
                  value="hello@meditrack.com"
                  icon={<MailIcon />}
                />
                <ContactInfo
                  label="Phone"
                  value="+1 (555) 123-4567"
                  icon={<PhoneIcon />}
                />
                <ContactInfo
                  label="Address"
                  value="San Francisco, CA"
                  icon={<PinIcon />}
                />
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-7 md:p-8">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-slate-800">
                    First Name
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-800">
                    Last Name
                  </label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="text-sm font-semibold text-slate-800">
                  Email
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="john@example.com"
                />
              </div>

              <div className="mt-5">
                <label className="text-sm font-semibold text-slate-800">
                  Message
                </label>
                <textarea
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30"
                  rows={6}
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="button"
                className="mt-7 w-full rounded-2xl py-4 font-extrabold text-white shadow-sm transition hover:opacity-95 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  Send Message
                  <SendIcon />
                </span>
              </button>

              <p className="mt-3 text-xs text-slate-500">
                * UI only (no data is sent).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="grid md:grid-cols-2 gap-8 items-center p-8 md:p-10">
              <div className="text-white">
                <h3 className="text-2xl md:text-3xl font-extrabold">
                  Start tracking today with MediTrack
                </h3>
                <p className="text-white/90 mt-2">
                  Choose your role, log your wellness, manage appointments, and
                  keep everything organized.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to="/choose-role"
                    className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-2xl font-semibold hover:opacity-95 transition"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 border border-white/40 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-white/10 transition"
                  >
                    Login
                  </Link>
                </div>
              </div>

              <div className="relative">
                <img
                  src={ctaImg}
                  alt="CTA illustration"
                  className="w-full rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative bg-slate-950 text-slate-200">
        <div className="absolute inset-x-0 -top-24 h-24 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 blur-2xl" />
        <div className="max-w-6xl mx-auto px-6 py-14 relative">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black">
                  M
                </div>
                <div className="text-xl font-extrabold">MediTrack</div>
              </div>

              <p className="mt-4 text-slate-400 leading-relaxed max-w-md">
                Your personal health companion. Track wellness, manage
                appointments, and connect with healthcare providers seamlessly.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <SocialIcon label="Twitter">
                  <TwitterIcon />
                </SocialIcon>
                <SocialIcon label="LinkedIn">
                  <LinkedInIcon />
                </SocialIcon>
                <SocialIcon label="GitHub">
                  <GitHubIcon />
                </SocialIcon>
                <SocialIcon label="Instagram">
                  <InstagramIcon />
                </SocialIcon>
              </div>
            </div>

            <FooterCol
              title="Product"
              links={[
                { label: "Features", href: "#features" },
                { label: "How it works", href: "#how" },
                { label: "Trust", href: "#trust" },
                { label: "Contact", href: "#contact" },
              ]}
            />
            <FooterCol
              title="Company"
              links={[
                { label: "About", href: "#" },
                { label: "Blog", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Contact", href: "#contact" },
              ]}
            />
            <FooterCol
              title="Resources"
              links={[
                { label: "Documentation", href: "#" },
                { label: "Help Center", href: "#" },
                { label: "Privacy", href: "#" },
                { label: "Terms", href: "#" },
              ]}
            />
          </div>

          <div className="mt-12 border-t border-slate-800/80 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} MediTrack. All rights reserved.
            </p>
            <p className="text-sm text-slate-400">
              Made with <span className="text-red-400">❤</span> for better
              health
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Helpers ---------- */

function TrustItem({ title, desc }) {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-100 flex items-center justify-center text-blue-700">
        <ShieldCheck className="w-5 h-5" />
      </div>
      <div>
        <p className="font-bold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  );
}

function StepCard({ step, title, desc, icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay }}
      className="relative"
    >
      <div className="h-full rounded-3xl bg-white border border-slate-200 shadow-sm px-6 py-7">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
              {icon}
            </div>
            <div className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-extrabold shadow">
              {step}
            </div>
          </div>

          <div className="pt-1">
            <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
              {title}
            </h3>
          </div>
        </div>

        <p className="mt-4 text-slate-600 leading-relaxed">{desc}</p>
      </div>

      <div className="hidden lg:block absolute -right-3 top-[58px] w-3 h-3 rounded-full bg-white border border-slate-200 shadow-sm" />
    </motion.div>
  );
}

function ContactInfo({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-lg font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function MailIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7h16v10H4V7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M4 7l8 6 8-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 16.9v3a2 2 0 0 1-2.2 2c-2.7-.3-5.3-1.3-7.5-2.9a21.3 21.3 0 0 1-6.5-6.5C4.2 10.3 3.2 7.7 3 5A2 2 0 0 1 5 2.8h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L9 10c1.4 2.6 3.6 4.8 6.2 6.2l.7-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6A2 2 0 0 1 22 16.9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 2L11 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 2l-7 20-4-9-9-4 20-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <p className="text-sm font-extrabold text-white">{title}</p>
      <ul className="mt-4 space-y-3 text-slate-400">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="hover:text-white transition">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ label, children }) {
  return (
    <a
      href="#"
      aria-label={label}
      onClick={(e) => e.preventDefault()}
      className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-700 transition"
    >
      {children}
    </a>
  );
}

function TwitterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.4-1.3 1.7-2.2-.8.5-1.7.8-2.6 1A4 4 0 0 0 12 8.4c0 .3 0 .6.1.8-3.4-.2-6.4-1.8-8.4-4.4-.4.6-.6 1.3-.6 2.1 0 1.4.7 2.6 1.8 3.3-.6 0-1.2-.2-1.8-.5v.1c0 2 1.4 3.7 3.3 4.1-.3.1-.7.1-1 .1-.2 0-.5 0-.7-.1.5 1.7 2.1 2.9 4 3A8.1 8.1 0 0 1 2 19.3 11.5 11.5 0 0 0 8.3 21c7.5 0 11.6-6.3 11.6-11.7v-.5c.8-.6 1.5-1.3 2.1-2.1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V14a6 6 0 0 1 6-6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M2 9h4v12H2V9Z" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 19c-4 1.5-4-2.5-6-3m12 6v-3.5c0-1 .1-1.8-.5-2.5 2 0 4-.5 4-4.5 0-1-.4-2-1-2.8.1-.3.5-1.4-.1-2.8 0 0-1-.3-3.2 1.1a11 11 0 0 0-5.8 0C6.2 4 5.2 4.3 5.2 4.3c-.6 1.4-.2 2.5-.1 2.8-.6.8-1 1.8-1 2.8 0 4 2 4.5 4 4.5-.3.4-.5.9-.5 1.7V22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M17.5 6.5h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
