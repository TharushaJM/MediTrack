import { useState } from "react";
import axios from "axios";
import {
  Moon,
  Droplets,
  Activity,
  Ruler,
  Weight,
  Heart,
  ClipboardList,
  Brain,
  Pill,
} from "lucide-react";

export default function AddRecordForm({ onClose, onCreated }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    mood: 5,
    energy: 5,
    stress: 5,
    notes: "",
    sleepHours: "",
    waterIntake: "",
    meals: "Average",
    exercise: "",
    symptoms: "",
    tookMeds: false,
    height: "",
    weight: "",
  });
  const [saving, setSaving] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const calcBMI = () => {
    if (!form.height || !form.weight) return null;
    const bmi = form.weight / ((form.height / 100) ** 2);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return "";
    const val = parseFloat(bmi);
    if (val < 18.5) return "Underweight";
    if (val < 25) return "Normal";
    if (val < 30) return "Overweight";
    return "Obese";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:5000/api/records",
        { ...form, bmi: calcBMI() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onCreated(data);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to save record. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-700">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold">
            <ClipboardList className="w-5 h-5" />
            <span>Daily Wellness Check-In</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* SECTION 1: Mood & Wellbeing */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              How do you feel today?
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                  Mood ({form.mood}/10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={form.mood}
                  onChange={(e) => update("mood", Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                    Energy ({form.energy}/10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={form.energy}
                    onChange={(e) => update("energy", Number(e.target.value))}
                    className="w-full accent-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                    Stress ({form.stress}/10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={form.stress}
                    onChange={(e) => update("stress", Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>
              </div>

              <textarea
                className="border border-gray-300 dark:border-gray-600 rounded-xl w-full p-3 mt-2 
                  bg-white dark:bg-gray-700 
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                  focus:border-transparent outline-none
                  transition-colors"
                rows="3"
                placeholder="Any thoughts, notes or symptoms today..."
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </div>
          </section>

          {/* SECTION 2: Daily Habits */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
              Daily Habits
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <HabitInput
                icon={<Moon className="w-4 h-4 text-blue-500" />}
                placeholder="Sleep (hrs)"
                value={form.sleepHours}
                onChange={(e) => update("sleepHours", e.target.value)}
              />
              <HabitInput
                icon={<Droplets className="w-4 h-4 text-cyan-500" />}
                placeholder="Water intake (L)"
                value={form.waterIntake}
                onChange={(e) => update("waterIntake", e.target.value)}
              />
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 
                  bg-white dark:bg-gray-700 
                  text-gray-700 dark:text-gray-200 
                  focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 
                  focus:border-transparent outline-none"
                value={form.meals}
                onChange={(e) => update("meals", e.target.value)}
              >
                <option>Healthy</option>
                <option>Average</option>
                <option>Skipped</option>
              </select>
              <HabitInput
                icon={<Activity className="w-4 h-4 text-purple-500" />}
                placeholder="Exercise (min)"
                value={form.exercise}
                onChange={(e) => update("exercise", e.target.value)}
              />
            </div>
          </section>

          {/* SECTION 3: Physical Stats */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Body Stats
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <HabitInput
                icon={<Ruler className="w-4 h-4 text-pink-500" />}
                placeholder="Height (cm)"
                value={form.height}
                onChange={(e) => update("height", e.target.value)}
              />
              <HabitInput
                icon={<Weight className="w-4 h-4 text-amber-500" />}
                placeholder="Weight (kg)"
                value={form.weight}
                onChange={(e) => update("weight", e.target.value)}
              />
            </div>
            {form.height && form.weight && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                BMI:{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {calcBMI()}
                </span>{" "}
                — {getBMICategory(calcBMI())}
              </p>
            )}
          </section>

          {/* SECTION 4: Symptoms */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-indigo-600" />
              Any symptoms today?
            </h3>
            <textarea
              className="border border-gray-300 dark:border-gray-600 rounded-xl w-full p-3 
                bg-white dark:bg-gray-700 
                text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 
                focus:border-transparent outline-none"
              rows="2"
              placeholder="E.g. headache, fatigue, mild cough..."
              value={form.symptoms}
              onChange={(e) => update("symptoms", e.target.value)}
            />
            <label className="flex items-center mt-3 gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={form.tookMeds}
                onChange={(e) => update("tookMeds", e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              I took my medication today
            </label>
          </section>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                text-gray-600 dark:text-gray-400 
                hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl 
                bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 
                text-white font-medium shadow-lg 
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200"
            >
              {saving ? "Saving..." : "Save Check-in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HabitInput({ icon, placeholder, value, onChange }) {
  return (
    <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
      bg-white dark:bg-gray-700
      focus-within:ring-2 focus-within:ring-blue-400 dark:focus-within:ring-blue-500 transition">
      {icon}
      <input
        type="text"
        className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

