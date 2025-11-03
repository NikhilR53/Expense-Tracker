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
  income: ["#4ade80", "#22c55e", "#86efac", "#16a34a", "#bbf7d0"], // green shades
  expense: ["#f87171", "#ef4444", "#fca5a5", "#dc2626", "#fecaca"], // red shades
  overview: ["#4ade80", "#f87171"], // green for income, red for expense
};

export function ChartView({ transactions }: { transactions: Transaction[] }) {
  const [view, setView] = useState("overview"); // overview | income | expense

  const { overviewData, incomeByCategory, expenseByCategory } = useMemo(() => {
    const incomeTransactions = transactions.filter((t) => t.type === "income");
    const expenseTransactions = transactions.filter((t) => t.type === "expense");

    // totals
    const incomeTotal = incomeTransactions.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );
    const expenseTotal = expenseTransactions.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );

    // overview chart (income vs expense)
    const overviewData = [
      { name: "Income", value: incomeTotal },
      { name: "Expense", value: expenseTotal },
    ];

    // income grouped by category
    const incomeByCategoryMap = incomeTransactions.reduce((acc, t) => {
      const cat = t.category || "Other";
      acc[cat] = (acc[cat] || 0) + Number(t.amount || 0);
      return acc;
    }, {} as Record<string, number>);
    const incomeByCategory = Object.entries(incomeByCategoryMap).map(
      ([name, value]) => ({ name, value })
    );

    // expense grouped by category
    const expenseByCategoryMap = expenseTransactions.reduce((acc, t) => {
      const cat = t.category || "Other";
      acc[cat] = (acc[cat] || 0) + Number(t.amount || 0);
      return acc;
    }, {} as Record<string, number>);
    const expenseByCategory = Object.entries(expenseByCategoryMap).map(
      ([name, value]) => ({ name, value })
    );

    return { overviewData, incomeByCategory, expenseByCategory };
  }, [transactions]);

  // pick data & colors for selected view
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {view === "overview"
            ? "Expenses vs Income"
            : view === "income"
            ? "Income by Category"
            : "Expenses by Category"}
        </h2>

        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md px-3 py-1 outline-none"
        >
          <option value="overview">Expenses vs Income</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div className="w-full h-64 flex justify-center items-center">
        {!hasData ? (
          <p className="text-gray-500 dark:text-gray-400">No transactions.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={(entry: any) =>
                  `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`
                }
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={colorSet[i % colorSet.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
