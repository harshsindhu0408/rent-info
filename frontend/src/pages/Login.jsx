import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Car } from "lucide-react";

const Login = () => {
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 text-primary-600">
          <Car size={32} />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-500 mb-8">
          Sign in to manage your fleet and rentals
        </p>

        <button
          onClick={login}
          className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm font-medium"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-6 h-6"
          />
          <span>Sign in with Google</span>
        </button>

        <p className="mt-8 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} RentManager Inc.
        </p>
      </div>
    </div>
  );
};

export default Login;
