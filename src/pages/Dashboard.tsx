import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { useAuth } from "../components/AuthProvider";
import { AddTransactionForm } from "../components/AddTransactionForm";
import { TransactionList } from "../components/TransactionList";
import { SummaryCard } from "../components/SummaryCard";
import { ChartView } from "../components/ChartView";
import { Loader2 } from "lucide-react";
import SpendingTrendChart from "../components/SpendingTrendChart";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import type { Transaction } from "../lib/firebaseTransactions";

type DashboardProps = {
  selectedMonth: string;
  selectedType: "all" | "income" | "expense";
};

export default function Dashboard({ selectedMonth, selectedType }: DashboardProps) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trendData, setTrendData] = useState<{ date: string; income: number; expense: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, "transactions"),
        where("user_id", "==", user.uid),
        orderBy("date", "asc")
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Transaction),
      }));

      setTransactions(data);

      // Build trend data
      const grouped: Record<string, { income: number; expense: number }> = {};
      data.forEach((t) => {
        const dateObj =
          (t.date as any)?.seconds
            ? new Date((t.date as any).seconds * 1000)
            : new Date(t.date as any);
        const dateStr = dateObj.toISOString().split("T")[0];

        if (!grouped[dateStr]) grouped[dateStr] = { income: 0, expense: 0 };
        if (t.type === "income") grouped[dateStr].income += Number(t.amount);
        else grouped[dateStr].expense += Number(t.amount);
      });

      setTrendData(
        Object.entries(grouped).map(([date, { income, expense }]) => ({
          date,
          income,
          expense,
        }))
      );
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError(err.message || "Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  // Apply filters
  const filteredTransactions = transactions.filter((t) => {
    const dateObj =
      (t.date as any)?.seconds
        ? new Date((t.date as any).seconds * 1000)
        : new Date(t.date as any);
    const tMonth = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;

    const matchMonth = selectedMonth === "all" || tMonth === selectedMonth;
    const matchType = selectedType === "all" || t.type === selectedType;

    return matchMonth && matchType;
  });

  // Compute summary
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const balance = totalIncome - totalExpenses;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-6 py-4 rounded-lg max-w-md">
          <h3 className="font-semibold text-lg mb-2">Error loading data</h3>
          <p>{error}</p>
          <button
            onClick={fetchTransactions}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <SummaryCard totalIncome={totalIncome} totalExpenses={totalExpenses} balance={balance} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1">
          <AddTransactionForm onTransactionAdded={fetchTransactions} />
        </div>
        <div className="lg:col-span-2">
          <ChartView transactions={filteredTransactions} />
        </div>
      </div>

      <TransactionList
        transactions={filteredTransactions}
        onTransactionUpdated={fetchTransactions}
        onTransactionDeleted={fetchTransactions}
      />

      {trendData.length > 0 && (
        <div className="mt-10">
          <SpendingTrendChart data={trendData} />
        </div>
      )}
    </div>
  );
}
