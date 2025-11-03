import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

type SummaryCardProps = {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
};

export function SummaryCard({ totalIncome, totalExpenses, balance }: SummaryCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Income */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium opacity-90">Total Income</h3>
          <TrendingUp size={24} className="opacity-90" />
        </div>
        <p className="text-3xl font-bold">₹{totalIncome.toFixed(2)}</p>
      </div>

      {/* Total Expenses */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium opacity-90">Total Expenses</h3>
          <TrendingDown size={24} className="opacity-90" />
        </div>
        <p className="text-3xl font-bold">₹{totalExpenses.toFixed(2)}</p>
      </div>

      {/* Balance */}
      <div
        className={`bg-gradient-to-br ${
          balance >= 0
            ? "from-blue-500 to-blue-600"
            : "from-orange-500 to-orange-600"
        } rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium opacity-90">Balance</h3>
          <Wallet size={24} className="opacity-90" />
        </div>
        <p className="text-3xl font-bold">₹{balance.toFixed(2)}</p>
      </div>
    </div>
  );
}
