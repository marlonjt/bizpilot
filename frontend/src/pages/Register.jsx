import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RegisterForm() {
  // --- FORM STATE ---
  // We use separate states for each input field to keep track of user typing
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- UI STATE ---
  const [errorMessage, setErrorMessage] = useState("");

  // --- TOOLS ---
  const { register } = useAuth(); // Auth context to handle user creation
  const navigate = useNavigate(); // Router tool to redirect after success

  //Handles the registration process
  const handleRegisterSubmit = async (event) => {
    event.preventDefault(); // Prevents page refresh
    setErrorMessage(""); // Clears previous errors

    // Checking if passwords match before hitting the API
    if (password !== confirmPassword) {
      return setErrorMessage("Passwords do not match");
    }

    try {
      await register(fullName, email, password);
      navigate("/login");
    } catch (error) {
      setErrorMessage("Email already in use");
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        {/* Header Section */}
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="mx-auto w-fit">
            <span className="text-3xl font-black text-indigo-500">Biz</span>
            <span className="text-3xl font-black text-white">Pilot</span>
          </div>
          <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-white">
            Create your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            {/* ERROR MESSAGE: Placed at the top with a single pulse animation */}
            {errorMessage && (
              <div className="rounded-md bg-red-500/10 p-4 border border-red-500/50 text-red-400 text-sm animate-[pulse_0.9s_ease-in-out_1]">
                {errorMessage}
              </div>
            )}

            {/* Input Groups: Consistent styling across the app */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-100"
              >
                Full name
              </label>
              <div className="mt-2">
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  placeholder="e.g. John Smith"
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-100"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                border
                className="block text-sm font-medium text-gray-100"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-100"
              >
                Confirm password
              </label>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors focus:ring-2 focus:ring-indigo-500"
            >
              Create account
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-10 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
