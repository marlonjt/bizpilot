import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./pages/Login";
import Products from "./pages/Products";
import Dashboard from "./pages/Dashboard";
import RegisterForm from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/" element={<Navigate to="/login" />} />
      <Route element={<ProtectedRoute />}>
        {/* Todas las rutas aquí adentro están automáticamente protegidas */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
      </Route>
    </Routes>
  );
}

export default App;
