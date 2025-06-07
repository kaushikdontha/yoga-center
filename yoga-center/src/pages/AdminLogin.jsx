import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/axios";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Clear any existing auth data on component mount
  useEffect(() => {
    localStorage.clear();
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin");
    
    if (token && isAdmin === "true") {
      navigate("/admin/events");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log('Attempting login with:', { username: username.trim() });
      
      const response = await api.post("/api/auth/login", {
        username: username.trim(),
        password,
      });

      console.log('Login response:', response.data);

      // Validate response structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from server');
      }

      // Check for success flag and required data
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Invalid response structure from server');
      }

      const { token, user } = response.data.data;

      // Validate token and user data
      if (!token || !user || !user.role) {
        throw new Error('Missing required data in server response');
      }

      // Store auth data
      localStorage.setItem("token", token);
      localStorage.setItem("isAdmin", user.role === 'admin' ? "true" : "false");
      localStorage.setItem("user", JSON.stringify(user));

      // Navigate to the return URL or admin dashboard
      const returnTo = location.state?.from?.pathname || "/admin/events";
      navigate(returnTo, { replace: true });
    } catch (err) {
      console.error("Login error:", err.response || err);
      
      // Handle different error scenarios
      if (err.response?.status === 401) {
        setError("Invalid username or password");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <div className="mt-2 text-center text-sm text-gray-600">
            <p>Username: Raviyoga</p>
            <p>Password: RaviYoga@924</p>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Sign in"}
            </button>
          </div>

          <div className="text-sm text-center text-gray-600">
            Default credentials:<br/>
            Username: Raviyoga<br/>
            Password: RaviYoga@924
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
