import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Moon, Sun, Wallet, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "./lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [selectedType, setSelectedType] = useState<"all" | "income" | "expense">("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  // 🌙 Load theme from localStorage
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    document.documentElement.classList.toggle("dark", newMode);
  };

  // 🔥 Fetch unique months from transactions
  useEffect(() => {
    const fetchMonths = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const monthSet = new Set<string>();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const rawDate = data.date || data.timestamp || data.createdAt;
          if (!rawDate) return;
          let date: Date | null = null;

          if (typeof rawDate === "object" && rawDate?.toDate) date = rawDate.toDate();
          else if (rawDate?.seconds) date = new Date(rawDate.seconds * 1000);
          else if (typeof rawDate === "string" || typeof rawDate === "number") {
            const parsed = new Date(rawDate);
            if (!isNaN(parsed.getTime())) date = parsed;
          }

          if (date && !isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            monthSet.add(`${year}-${month}`);
          }
        });

        const sortedMonths = Array.from(monthSet).sort((a, b) => (a > b ? -1 : 1));
        setAvailableMonths(sortedMonths);
      } catch (err) {
        console.error("Error fetching months:", err);
      }
    };
    fetchMonths();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {/* 🌙 Dark Mode Toggle on Login Page */}
        <button
          onClick={toggleDarkMode}
          className="fixed top-4 right-4 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        >
          {darkMode ? <Sun size={24} className="text-yellow-500" /> : <Moon size={24} className="text-gray-700 dark:text-gray-300" />}
        </button>

        {showLogin ? (
          <Login onToggleView={() => setShowLogin(false)} />
        ) : (
          <Register onToggleView={() => setShowLogin(true)} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      {/* 🔔 Toast Notifications */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* ✅ Header / Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 w-full">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* Left side: App Name */}
          <div className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
            <Wallet className="text-blue-600 dark:text-blue-400" />
            Expense Tracker
          </div>

          {/* Right side: Controls */}
          <div className="flex items-center gap-4">
            {/* Type filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as "all" | "income" | "expense")}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md px-3 py-1 outline-none"
            >
              <option value="all">All Transactions</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            {/* Month filter */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md px-3 py-1 outline-none"
            >
              <option value="all">All Months</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:scale-105 transition-transform"
            >
              {darkMode ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} className="text-gray-700 dark:text-gray-200" />
              )}
            </button>

            {/* 👤 User info */}
            {user && (
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-blue-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {user.displayName?.[0] || "U"}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {user.displayName || "User"}
                </span>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={signOut}
              className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard should also take full width */}
      <div className="flex-1 w-full flex justify-center">
        <Dashboard selectedMonth={selectedMonth} selectedType={selectedType} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
