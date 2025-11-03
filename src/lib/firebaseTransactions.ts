import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";

export type Transaction = {
  id?: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string; // "YYYY-MM-DD"
  user_id: string;
  createdAt?: Timestamp;
};

// ✅ Fetch all transactions for a specific user (sorted by createdAt)
export const getUserTransactions = async (userId: string) => {
  try {
    const q = query(
      collection(db, "transactions"),
      where("user_id", "==", userId),
      orderBy("createdAt", "asc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => {
      const data = d.data() as Omit<Transaction, "id">;

      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt : undefined,
      };
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

// ✅ Add a new transaction
export const addTransaction = async (transaction: Omit<Transaction, "id">) => {
  try {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // "YYYY-MM-DD"

    await addDoc(collection(db, "transactions"), {
      ...transaction,
      date: transaction.date || formattedDate, // ensure consistent format
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
  }
};

// ✅ Update an existing transaction
export const updateTransaction = async (
  id: string,
  updatedData: Partial<Transaction>
) => {
  try {
    const ref = doc(db, "transactions", id);
    await updateDoc(ref, updatedData);
  } catch (error) {
    console.error("Error updating transaction:", error);
  }
};

// ✅ Delete a transaction
export const deleteTransaction = async (id: string) => {
  try {
    const ref = doc(db, "transactions", id);
    await deleteDoc(ref);
  } catch (error) {
    console.error("Error deleting transaction:", error);
  }
};
