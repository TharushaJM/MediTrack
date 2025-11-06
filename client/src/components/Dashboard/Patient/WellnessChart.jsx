import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function WellnessChart({ records }) {
  if (!records?.length)
    return (
      <div className="bg-white border rounded-2xl p-10 text-center text-gray-500">
        Not enough data yet to show your wellness trends.
      </div>
    );

  const data = records
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      mood: r.mood ?? 0,
      sleep: r.sleepHours ?? 0,
      water: r.waterIntake ?? 0,
      bmi: r.bmi ?? 0,
    }));

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Your Wellness Trends
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 12 }} />
          <YAxis tick={{ fill: "#888", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #eee",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{
              fontSize: "13px",
              color: "#555",
            }}
          />

          {/* Lines with improved colors */}
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#6366f1"
            name="Mood (1–10)"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="sleep"
            stroke="#22c55e"
            name="Sleep (hrs)"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="water"
            stroke="#06b6d4"
            name="Water (L)"
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="bmi"
            stroke="#f59e0b"
            name="BMI"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
