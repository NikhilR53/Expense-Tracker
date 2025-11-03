import { useState } from "react";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthProvider";
import { Plus, CheckCircle2, XCircle } from "lucide-react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion"; // npm install framer-motion

type TransactionFormData = {
  title: string;
  amount: string;
  category: string;
  type: "income" | "expense";
  date: string;
};

type AddTransactionFormProps = {
  onTransactionAdded: () => void;
};

const categories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Salary",
  "Freelance",
  "Investments",
  "Other",
];

export function AddTransactionForm({ onTransactionAdded }: AddTransactionFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<TransactionFormData>({
    title: "",
    amount: "",
    category: categories[0],
    type: "expense",
    date: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState<string>("");

  const resetStatus = () => {
    setTimeout(() => {
      setStatus(null);
      setMessage("");
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setStatus(null);

    try {
      await addDoc(collection(db, "transactions"), {
        user_id: user.uid,
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        type: formData.type,
        date: formData.date,
        createdAt: Timestamp.now(),
      });

      setStatus("success");
      setMessage("Transaction added successfully!");
      resetStatus();

      // Reset form
      setFormData({
        title: "",
        amount: "",
        category: categories[0],
        type: "expense",
        date: new Date().toISOString().split("T")[0],
      });

      onTransactionAdded?.();
    } catch (err: any) {
      console.error("Error adding transaction:", err);
      setStatus("error");
      setMessage(err.message || "Failed to add transaction");
      resetStatus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Add Transaction
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Grocery shopping"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white focus:border-transparent transition-all"
          />
        </div>

        {/* Amount */}
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Amount
          </label>
          <input
            id="amount"
            type="number"
            required
            step="0.01"
            min="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white focus:border-transparent transition-all"
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white focus:border-transparent transition-all"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          <div className="flex gap-4">
            {["expense", "income"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData({ ...formData, type: t as "expense" | "income" })}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  formData.type === t
                    ? t === "income"
                      ? "bg-green-500 text-white shadow-lg"
                      : "bg-red-500 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Date
          </label>
          <input
            id="date"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white focus:border-transparent transition-all"
          />
        </div>

        {/* Success / Error Message */}
        <AnimatePresence mode="wait">
          {status && (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                status === "success"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800 text-green-600 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400"
              }`}
            >
              {status === "success" ? (
                <CheckCircle2 size={20} />
              ) : (
                <XCircle size={20} />
              )}
              <span>{message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          {loading ? "Adding..." : "Add Transaction"}
        </button>
      </form>
    </div>
  );
}
