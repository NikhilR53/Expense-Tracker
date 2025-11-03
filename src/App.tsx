import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Moon, Sun, Wallet, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { db } from "./lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { format } from "date-fns";

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

  // 🧩 Robust Firestore month fetcher with debug logs
  useEffect(() => {
    const parseDate = (raw: any): Date | null => {
      if (!raw) return null;
      if (raw instanceof Date) return raw;
      if (typeof raw?.toDate === "function") return raw.toDate();
      if (raw?.seconds) return new Date(raw.seconds * 1000);
      if (typeof raw === "number") return new Date(raw < 1e12 ? raw * 1000 : raw);
      if (typeof raw === "string") {
        const d = new Date(raw);
        return isNaN(d.getTime()) ? null : d;
      }
      return null;
    };

    const fetchMonths = async () => {
      if (!user) {
        setAvailableMonths([]);
        return;
      }

      try {
        const q = query(collection(db, "transactions"));
        const snap = await getDocs(q);

        if (snap.empty) {
          console.warn("⚠️ No transactions found in Firestore!");
          setAvailableMonths([]);
          return;
        }

        const months = new Set<string>();
        let foundUser = false;

        snap.forEach((doc) => {
          const data = doc.data();
          const owner =
            data.userId ?? data.user_id ?? data.user ?? data.uid ?? data.ownerId;

          if (!owner || owner !== user.uid) return;
          foundUser = true;

          const rawDate =
            data.date ??
            data.timestamp ??
            data.createdAt ??
            data.time ??
            data.addedOn ??
            data.created_at ??
            data.ts ??
            data.created;

          const d = parseDate(rawDate);
          if (d && !isNaN(d.getTime())) {
            months.add(format(d, "MMMM yyyy"));
          } else {
            console.warn("⛔ Unreadable date in doc:", doc.id, rawDate);
          }
        });

        if (!foundUser) {
          console.warn("⚠️ No transactions matched this user:", user.uid);
        }

        const sorted = Array.from(months).sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime()
        );

        console.log("✅ Available months:", sorted);
        setAvailableMonths(sorted);
      } catch (err) {
        console.error("🔥 Firestore fetch error:", err);
      }
    };

    fetchMonths();
  }, [user]);

  // 🌀 Loading screen
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

  // 🔐 Not logged in → show Login/Register
  if (!user) {
    return (
      <>
        {/* 🌙 Dark Mode Toggle (Visible on Auth Pages) */}
        <button
          onClick={toggleDarkMode}
          className="fixed top-4 right-4 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        >
          {darkMode ? (
            <Sun size={24} className="text-yellow-500" />
          ) : (
            <Moon size={24} className="text-gray-700 dark:text-gray-300" />
          )}
        </button>

        {showLogin ? (
          <Login onToggleView={() => setShowLogin(false)} />
        ) : (
          <Register onToggleView={() => setShowLogin(true)} />
        )}
      </>
    );
  }

  // ✅ Logged-in user → show dashboard
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Toaster position="top-center" reverseOrder={false} />

      {/* 🔝 Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 p-3 sm:p-4 border-b dark:border-gray-700">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between sm:items-center gap-3">

          {/* ─── Left side ─── */}
          <div className="flex justify-between items-center w-full sm:w-auto">
            <div className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
              <Wallet className="text-blue-600 dark:text-blue-400" />
              Expense Tracker
            </div>

            {/* ─── Mobile controls ─── */}
            <div className="flex items-center gap-3 sm:hidden">
              {user && (
                <div className="flex items-center gap-2">
                  <img
                    src={user.photoURL || ""}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-blue-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user.displayName || "User"}
                  </span>
                </div>
              )}

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

              <button
                onClick={signOut}
                className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-medium"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          {/* ─── Right side (Filters + Actions for desktop) ─── */}
          <div className="flex flex-wrap gap-2 justify-between sm:justify-end items-center w-full sm:w-auto">
            {/* Filters */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md px-3 py-1"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md px-3 py-1"
            >
              <option value="all">All Months</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="hidden sm:block p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:scale-105 transition-transform"
            >
              {darkMode ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} className="text-gray-700 dark:text-gray-200" />
              )}
            </button>

            {/* User Info (Desktop) */}
            {user && (
              <div className="hidden sm:flex items-center gap-2">
                <img
                  src={user.photoURL || ""}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-blue-500"
                  referrerPolicy="no-referrer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user.displayName || "User"}
                </span>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={signOut}
              className="hidden sm:flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </nav>
      {/* 🧭 Dashboard */}
      <Dashboard selectedMonth={selectedMonth} selectedType={selectedType} />
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
