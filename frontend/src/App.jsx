import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./pages/Login";
import RegisterForm from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Protected routes — ProtectedRoute checks auth for all children */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/sales" element={<Sales />} />
      </Route>
    </Routes>
  );
}

export default App;
