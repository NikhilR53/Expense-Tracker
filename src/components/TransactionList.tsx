import { useState } from "react";
import { Pencil, Trash2, Calendar, Tag } from "lucide-react";
import { EditTransactionModal } from "./EditTransactionModal";
import { deleteTransaction, Transaction } from "../lib/firebaseTransactions";

type TransactionListProps = {
  transactions: Transaction[];
  onTransactionUpdated: () => void;
  onTransactionDeleted: () => void;
};

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onTransactionUpdated,
  onTransactionDeleted,
}) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // ✅ Extract unique categories
  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  // ✅ Filter transactions by selected category
  const filteredTransactions =
    selectedCategory === "all"
      ? transactions
      : transactions.filter((t) => t.category === selectedCategory);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(id);
        onTransactionDeleted();
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Transactions
        </h2>

        {/* ✅ Category Filter Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                     dark:bg-gray-700 dark:text-white transition-colors"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Empty State */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No transactions found for this category.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 
                         rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {/* Left Section */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {transaction.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Tag size={14} />
                    {transaction.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(transaction.date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-4">
                <span
                  className={`text-xl font-bold ${
                    transaction.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}₹
                  {transaction.amount.toFixed(2)}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingTransaction(transaction)}
                    className="p-2 text-blue-600 dark:text-blue-400 
                               hover:bg-blue-50 dark:hover:bg-blue-900/20 
                               rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="p-2 text-red-600 dark:text-red-400 
                               hover:bg-red-50 dark:hover:bg-red-900/20 
                               rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingTransaction && editingTransaction.id && (
        <EditTransactionModal
          transaction={{ ...editingTransaction, id: editingTransaction.id }}
          onClose={() => setEditingTransaction(null)}
          onUpdated={() => {
            setEditingTransaction(null);
            onTransactionUpdated();
          }}
        />
      )}
    </div>
  );
};
