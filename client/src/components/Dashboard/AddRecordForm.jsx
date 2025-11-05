import { useState } from "react";
import axios from "axios";

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

  function update(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  // compute BMI live
  function calcBMI() {
    if (!form.height || !form.weight) return null;
    const bmi = form.weight / ((form.height / 100) ** 2);
    return bmi.toFixed(1);
  }

  function getBMICategory(bmi) {
    if (!bmi) return "";
    const val = parseFloat(bmi);
    if (val < 18.5) return "Underweight";
    if (val < 25) return "Normal";
    if (val < 30) return "Overweight";
    return "Obese";
  }

  async function submit(e) {
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
    } catch (e) {
      console.error(e);
      alert("Failed to save record");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">🩺 Daily Wellness Check-in</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="p-4 space-y-6">
          {/* Section 1: How do you feel */}
          <section>
            <h3 className="text-md font-semibold text-gray-700 mb-2">
              🧍 How do you feel today?
            </h3>

            <label className="block mb-1 text-sm">Mood</label>
            <input
              type="range"
              min="1"
              max="10"
              className="w-full accent-blue-600"
              value={form.mood}
              onChange={(e) => update("mood", Number(e.target.value))}
            />
            <p className="text-gray-600 text-sm text-right">
              {form.mood}/10
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-sm mb-1">Energy</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="w-full accent-green-600"
                  value={form.energy}
                  onChange={(e) => update("energy", Number(e.target.value))}
                />
                <p className="text-sm text-right">{form.energy}/10</p>
              </div>

              <div>
                <label className="block text-sm mb-1">Stress</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  className="w-full accent-red-500"
                  value={form.stress}
                  onChange={(e) => update("stress", Number(e.target.value))}
                />
                <p className="text-sm text-right">{form.stress}/10</p>
              </div>
            </div>

            <textarea
              className="border rounded-lg p-2 w-full mt-3"
              placeholder="Any notes or thoughts for today..."
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </section>

          {/* Section 2: Daily habits */}
          <section>
            <h3 className="text-md font-semibold text-gray-700 mb-2">
              🌿 Your daily habits
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                className="border rounded-lg p-2"
                placeholder="Sleep (hrs)"
                value={form.sleepHours}
                onChange={(e) => update("sleepHours", e.target.value)}
              />
              <input
                className="border rounded-lg p-2"
                placeholder="Water intake (L)"
                value={form.waterIntake}
                onChange={(e) => update("waterIntake", e.target.value)}
              />
              <select
                className="border rounded-lg p-2"
                value={form.meals}
                onChange={(e) => update("meals", e.target.value)}
              >
                <option>Healthy</option>
                <option>Average</option>
                <option>Skipped</option>
              </select>
              <input
                className="border rounded-lg p-2"
                placeholder="Exercise (min)"
                value={form.exercise}
                onChange={(e) => update("exercise", e.target.value)}
              />
            </div>
          </section>

          {/* Section 3: Physical metrics */}
          <section>
            <h3 className="text-md font-semibold text-gray-700 mb-2">
              ⚖️ Your Body Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                className="border rounded-lg p-2"
                placeholder="Height (cm)"
                value={form.height}
                onChange={(e) => update("height", e.target.value)}
              />
              <input
                className="border rounded-lg p-2"
                placeholder="Weight (kg)"
                value={form.weight}
                onChange={(e) => update("weight", e.target.value)}
              />
            </div>
            {form.height && form.weight && (
              <p className="text-sm text-gray-600 mt-2">
                BMI:{" "}
                <span className="font-semibold text-blue-600">
                  {calcBMI()}
                </span>{" "}
                — {getBMICategory(calcBMI())}
              </p>
            )}
          </section>

          {/* Section 4: Symptoms */}
          <section>
            <h3 className="text-md font-semibold text-gray-700 mb-2">
              🩺 Any symptoms today?
            </h3>
            <textarea
              className="border rounded-lg p-2 w-full"
              placeholder="E.g. headache, fatigue, mild cough..."
              rows={2}
              value={form.symptoms}
              onChange={(e) => update("symptoms", e.target.value)}
            />
            <label className="flex items-center mt-2 gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.tookMeds}
                onChange={(e) => update("tookMeds", e.target.checked)}
              />
              I took my medication today
            </label>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {saving ? "Saving..." : "Save Check-in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
