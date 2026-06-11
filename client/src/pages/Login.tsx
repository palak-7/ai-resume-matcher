import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "../hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin()
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await loginMutation.mutateAsync({ email, password })
      navigate("/dashboard");
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const error = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };

        setError(error.response?.data?.message || "Login failed");
      } else {
        setError("Login failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Sign in to your account</p>

        {error && (
          <div className={`px-4 py-3 rounded-lg mb-4 text-sm border ${error.includes('locked')
            ? 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
            : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
            }`}>
            {error.includes('locked') && <span className="mr-1">🔒</span>}
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-end mb-1">
            <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          <Link to="/" className="text-gray-400 hover:text-gray-600 text-xs">
            ← Back to home
          </Link>
        </p>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
