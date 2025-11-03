import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import type { Transaction } from "../lib/firebaseTransactions";

const COLORS = {
  income: ["#4ade80", "#22c55e", "#86efac", "#16a34a", "#bbf7d0"],
  expense: ["#f87171", "#ef4444", "#fca5a5", "#dc2626", "#fecaca"],
  overview: ["#4ade80", "#f87171"],
};

export function ChartView({ transactions }: { transactions: Transaction[] }) {
  const [view, setView] = useState("overview");

  const { overviewData, incomeByCategory, expenseByCategory } = useMemo(() => {
    const incomeTransactions = transactions.filter((t) => t.type === "income");
    const expenseTransactions = transactions.filter((t) => t.type === "expense");

    const incomeTotal = incomeTransactions.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );
    const expenseTotal = expenseTransactions.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );

    const overviewData = [
      { name: "Income", value: incomeTotal },
      { name: "Expense", value: expenseTotal },
    ];

    const incomeByCategory = Object.entries(
      incomeTransactions.reduce((acc, t) => {
        const cat = t.category || "Other";
        acc[cat] = (acc[cat] || 0) + Number(t.amount || 0);
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    const expenseByCategory = Object.entries(
      expenseTransactions.reduce((acc, t) => {
        const cat = t.category || "Other";
        acc[cat] = (acc[cat] || 0) + Number(t.amount || 0);
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    return { overviewData, incomeByCategory, expenseByCategory };
  }, [transactions]);

  let chartData = overviewData;
  let colorSet = COLORS.overview;

  if (view === "income") {
    chartData = incomeByCategory;
    colorSet = COLORS.income;
  } else if (view === "expense") {
    chartData = expenseByCategory;
    colorSet = COLORS.expense;
  }

  const hasData = chartData.some((d) => d.value > 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-6 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200 text-center sm:text-left">
          {view === "overview"
            ? "Expenses vs Income"
            : view === "income"
            ? "Income by Category"
            : "Expenses by Category"}
        </h2>

        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md px-3 py-1 text-sm sm:text-base outline-none"
        >
          <option value="overview">Expenses vs Income</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div className="w-full h-56 sm:h-64 md:h-72 flex justify-center items-center">
        {!hasData ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            No transactions available for this selection.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius="80%"
                dataKey="value"
                // 👇 Only show percentage now
                label={({ percent }: any) =>
                  `${(percent * 100).toFixed(0)}%`
                }
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={colorSet[i % colorSet.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: "clamp(10px, 1.5vw, 14px)",
                  backgroundColor: "#1F2937",
                  color: "#F9FAFB",
                  borderRadius: "8px",
                }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: "clamp(10px, 1.5vw, 14px)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
