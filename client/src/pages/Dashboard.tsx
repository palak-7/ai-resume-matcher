import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">
          AI Resume Matcher
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hi, {user?.name}</span>
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-500 mb-8">
          Upload your resume and match it against job descriptions.
        </p>

        <button
          onClick={() => navigate("/analyse")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + New Analysis
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
