import { useEffect, useState } from "react";
import { db } from "./lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "./components/AuthProvider";
import { Moon, Sun} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function App() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  // 🌓 Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // 📅 Fetch transactions
  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      const snapshot = await getDocs(collection(db, "transactions"));
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((item: any) => item.userId === user.uid);

      setTransactions(data);
      fetchMonths(data);
    };

    fetchTransactions();
  }, [user]);

  // 🧠 Extract months dynamically from all transaction dates
  const fetchMonths = (data: any[]) => {
    const monthsSet = new Set<string>();

    data.forEach((item) => {
      const rawDate =
        item.date ||
        item.timestamp ||
        item.createdAt ||
        item.time ||
        item.addedOn ||
        item.created_at;

      if (!rawDate) {
        console.warn("⚠️ No date found for transaction:", item);
        return;
      }

      let date: Date | null = null;

      // 🔄 Normalize date from multiple formats
      if (rawDate instanceof Date) {
        date = rawDate;
      } else if (typeof rawDate === "object" && rawDate.toDate) {
        date = rawDate.toDate();
      } else if (rawDate?.seconds) {
        date = new Date(rawDate.seconds * 1000);
      } else if (typeof rawDate === "string") {
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) date = parsed;
      }

      if (date && !isNaN(date.getTime())) {
        monthsSet.add(format(date, "MMMM yyyy"));
      } else {
        console.warn("⚠️ Invalid date:", rawDate);
      }
    });

    const sortedMonths = Array.from(monthsSet).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    setAvailableMonths(sortedMonths);
  };

  // 🎯 Filter transactions by month
  const filteredTransactions =
    selectedMonth === "all"
      ? transactions
      : transactions.filter((item) => {
          const rawDate =
            item.date ||
            item.timestamp ||
            item.createdAt ||
            item.time ||
            item.addedOn ||
            item.created_at;
          if (!rawDate) return false;

          let date: Date | null = null;
          if (rawDate instanceof Date) {
            date = rawDate;
          } else if (typeof rawDate === "object" && rawDate.toDate) {
            date = rawDate.toDate();
          } else if (rawDate?.seconds) {
            date = new Date(rawDate.seconds * 1000);
          } else if (typeof rawDate === "string") {
            const parsed = new Date(rawDate);
            if (!isNaN(parsed.getTime())) date = parsed;
          }

          if (!date) return false;
          return format(date, "MMMM yyyy") === selectedMonth;
        });

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <h1 className="text-2xl font-bold">Expense Tracker</h1>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md px-3 py-1 outline-none"
          >
            <option value="all">All Months</option>
            {availableMonths.length === 0 ? (
              <option disabled>No months available</option>
            ) : (
              availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))
            )}
          </select>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:scale-105 transition-transform"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Transactions */}
      <main className="p-4 max-w-3xl mx-auto space-y-4">
        {filteredTransactions.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No transactions found.
          </p>
        ) : (
          filteredTransactions.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex justify-between items-center p-4 rounded-xl shadow-md ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div>
                <h3 className="font-semibold text-lg">{t.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.category || "Uncategorized"}
                </p>
              </div>
              <span
                className={`font-semibold ${
                  t.type === "income"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {t.type === "income" ? "+" : "-"}₹{t.amount}
              </span>
            </motion.div>
          ))
        )}
      </main>
    </div>
  );
}
