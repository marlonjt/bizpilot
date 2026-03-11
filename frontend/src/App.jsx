import { Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}

export default App
