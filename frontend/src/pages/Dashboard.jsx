import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Bienvenido {user?.full_name}</h1>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}

export default Dashboard;
