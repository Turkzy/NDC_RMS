import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'

import Login from './pages/Login'
import Dashboard from './components/Dashboard'
import Logout from './pages/Logout'
import CreateAccount from './pages/create-account'

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    const handleStorageChange = (e) => {
      if (e.key === "token") setIsAuthenticated(!!e.newValue);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const ProtectedRoute = ({ element }) => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) return <Navigate to="/" replace />;

    try {
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return <Navigate to="/" replace />;
      }
      return element;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return <Navigate to="/" replace />;
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated
            ? location.pathname === "/dashboard"
              ? <Dashboard />
              : <Navigate to="/dashboard" replace />
            : <Login />
        }
      />
      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
      <Route path="/create-account" element={<CreateAccount />} />
      <Route path="/logout" element={<Logout />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter basename="/NDC_RMS/">
      <AppContent />
    </BrowserRouter>
  )
}

export default App