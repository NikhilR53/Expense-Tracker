import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { auth, googleProvider } from "../lib/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import toast from "react-hot-toast";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasWelcomed, setHasWelcomed] = useState(false); // 👈 prevent repeat toast

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // ✅ Show welcome toast only when first logged in
        if (!hasWelcomed) {
          toast.success(`Welcome back, ${firebaseUser.displayName || "User"}! 🎉`, {
            duration: 3000,
          });
          setHasWelcomed(true);
        }
      } else {
        setUser(null);
        setHasWelcomed(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [hasWelcomed]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Google Sign-In Error:", error.message);
      toast.error("Failed to sign in. Please try again.");
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      toast("Signed out successfully 👋", { icon: "👋" });
    } catch (error: any) {
      console.error("Sign-Out Error:", error.message);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signOut,
      }}
    >
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
          <div className="animate-pulse text-center">
            <p className="text-lg font-medium">Loading your account...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
