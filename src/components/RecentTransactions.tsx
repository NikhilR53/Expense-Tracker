import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthProvider";
import type { Transaction } from "../lib/firebaseTransactions";
import { Calendar, Tag } from "lucide-react";

export function RecentTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "transactions"),
      where("user_id", "==", user.uid),
      orderBy("date", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Transaction, "id">),
      }));
      setTransactions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No transactions found. Add one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Recent Transactions
      </h2>

      <ul className="space-y-4">
        {transactions.map((t) => (
          <li
            key={t.id}
            className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">
                {t.title}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Tag size={14} />
                  {t.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(t.date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* ✅ Updated ₹ inside this span */}
            <span
              className={`text-xl font-bold ${
                t.type === "income"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {t.type === "income"
                ? `+₹${Number(t.amount).toFixed(2)}`
                : `-₹${Number(t.amount).toFixed(2)}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
