import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function WellnessChart({ records }) {
  if (!records?.length)
    return (
      <div className="bg-white border rounded-xl p-8 text-center text-gray-600">
        Not enough data yet to show your wellness trends.
      </div>
    );

  const data = records
    .slice() // copy
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      mood: r.mood ?? 0,
      sleep: r.sleepHours ?? 0,
      water: r.waterIntake ?? 0,
      bmi: r.bmi ?? 0,
    }));

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Your Wellness Trends
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="mood" stroke="#3b82f6" name="Mood (1–10)" />
          <Line type="monotone" dataKey="sleep" stroke="#16a34a" name="Sleep (hrs)" />
          <Line type="monotone" dataKey="water" stroke="#06b6d4" name="Water (L)" />
          <Line type="monotone" dataKey="bmi" stroke="#f59e0b" name="BMI" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
