import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function MetricChart({ title, data, color, dataKey, unit }) {
  const chartData = data
    .filter((r) => r[dataKey] !== undefined && r[dataKey] !== null)
    .map((r) => ({
      date: new Date(r.date || r.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: r[dataKey],
    }));

  if (chartData.length === 0)
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 shadow-sm p-5 text-center text-gray-500 dark:text-gray-400">
        No {title.toLowerCase()} data yet
      </div>
    );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
      <h4
        className="font-semibold text-gray-700 dark:text-gray-200 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
      >
        {title}
      </h4>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fill: "#888", fontSize: 12 }} />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #eee",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={{ r: 3, strokeWidth: 2, stroke: color }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="text-sm text-gray-600 dark:text-gray-400 text-right mt-2">
        Latest:{" "}
        <span className="font-semibold text-gray-800 dark:text-gray-100">
          {chartData[chartData.length - 1].value}
        </span>{" "}
        {unit}
      </div>
    </div>
  );
}

