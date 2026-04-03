import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginForm() {
  // --- FORM STATE ---
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // --- TOOLS ---
  const { login } = useAuth(); // Auth context to manage global session
  const navigate = useNavigate(); // Router tool to change pages

  //Processes the login request.
  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    try {
      // Logic from AuthContext: sends credentials to the backend
      await login(userEmail, userPassword);

      // Success: Redirect to protected area
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Logo Section */}
        <div className="mx-auto w-fit">
          <span className="text-3xl font-black text-indigo-500">Biz</span>
          <span className="text-3xl font-black text-white">Pilot</span>
        </div>

        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleLoginSubmit} className="space-y-6">
          {/* Feedback for failed login */}
          {errorMessage && (
            <div className="rounded-md bg-red-500/10 p-4 border border-red-500/50 text-red-400 text-sm animate-[pulse_0.9s_ease-in-out_1]">
              {errorMessage}
            </div>
          )}

          {/* Email Input Group */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-100"
            >
              Email Address
            </label>
            <div className="mt-2">
              <input
                id="email"
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="block w-full rounded-md bg-white/5 px-3 py-2 text-white border border-white/10 outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password Input Group */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-100"
            >
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                type="password"
                required
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                className="block w-full rounded-md bg-white/5 px-3 py-2 text-white border border-white/10 outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors focus:ring-2 focus:ring-indigo-500"
          >
            Sign In
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-10 text-center text-sm text-gray-400">
          Not a member?{" "}
          <Link
            to="/register"
            className="font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
