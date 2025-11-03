import { useState, useMemo } from "react";
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

type TrendData = {
  date: string;
  income: number;
  expense: number;
};

interface SpendingTrendChartProps {
  data: TrendData[];
}

export default function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  const [viewMode, setViewMode] = useState<"daily" | "monthly" | "yearly">("monthly");

  // ✅ Group data based on view mode
  const groupedData = useMemo(() => {
    const grouped: Record<string, { income: number; expense: number }> = {};

    data.forEach((entry) => {
      const d = new Date(entry.date);
      let key = "";

      if (viewMode === "daily") {
        key = d.toLocaleDateString("en-GB"); // 02/11/2025
      } else if (viewMode === "monthly") {
        key = `${d.getFullYear()}-${d.toLocaleString("default", { month: "short" })}`; // 2025-Nov
      } else if (viewMode === "yearly") {
        key = `${d.getFullYear()}`;
      }

      if (!grouped[key]) grouped[key] = { income: 0, expense: 0 };

      grouped[key].income += entry.income;
      grouped[key].expense += entry.expense;
    });

    return Object.entries(grouped).map(([date, { income, expense }]) => ({
      date,
      income,
      expense,
    }));
  }, [data, viewMode]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Spending Trend
        </h2>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value as any)}
          className="bg-gray-100 dark:bg-gray-700 dark:text-gray-100 
          text-sm px-3 py-1.5 rounded-lg border dark:border-gray-600 focus:outline-none"
        >
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={groupedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} />
          <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
