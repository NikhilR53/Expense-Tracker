import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { auth, googleProvider } from "../lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

type LoginProps = {
  onToggleView: () => void;
};

export default function Login({ onToggleView }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") setError("User not found");
      else if (err.code === "auth/wrong-password") setError("Invalid password");
      else setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="w-full max-w-md bg-white/70 dark:bg-gray-900/70 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-700 transition-all">
        <h1 className="text-3xl font-bold text-center mb-6">
          Welcome Back 👋
        </h1>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" size={20} />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" size={20} />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
            />
            {showPassword ? (
              <EyeOff
                className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 cursor-pointer"
                size={20}
                onClick={() => setShowPassword(false)}
              />
            ) : (
              <Eye
                className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 cursor-pointer"
                size={20}
                onClick={() => setShowPassword(true)}
              />
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <div className="my-4 flex items-center justify-center">
          <div className="h-px bg-gray-300 dark:bg-gray-700 w-1/3"></div>
          <p className="mx-2 text-gray-500 dark:text-gray-400 text-sm">OR</p>
          <div className="h-px bg-gray-300 dark:bg-gray-700 w-1/3"></div>
        </div>

        <Button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50"
        >
          {loading ? "Connecting..." : "Sign in with Google"}
        </Button>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={onToggleView}
            className="text-blue-500 dark:text-blue-400 hover:underline"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
