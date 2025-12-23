import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import api, { endpoints } from './config/api'

import Login from './pages/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
import Logout from './pages/Logout.jsx'
import RequestConcern from "./pages/Concerns/RequestConcern.jsx"
import CreateAccount from './pages/create-account.jsx'
import PrintMonthlyReports from './pages/Reports/PrintMontlyReports.jsx'
import PrintYearlyReports from './pages/Reports/PrintYearlyReport.jsx'

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check authentication by making an API call
    const checkAuth = async () => {
      try {
        const user = sessionStorage.getItem("user");
        if (!user) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
          return;
        }

        // Verify authentication with backend (token in httpOnly cookie)
        const response = await api.get(endpoints.auth.verify);
        if (response.status === 200 && response.data.user) {
          setIsAuthenticated(true);
          // Update user data in case it changed
          sessionStorage.setItem("user", JSON.stringify(response.data.user));
        } else {
          setIsAuthenticated(false);
          sessionStorage.removeItem("user");
        }
      } catch (err) {
        setIsAuthenticated(false);
        sessionStorage.removeItem("user");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const ProtectedRoute = ({ element }) => {
    const [authStatus, setAuthStatus] = useState('checking');

    useEffect(() => {
      const verifyAuth = async () => {
    const user = sessionStorage.getItem("user");
        if (!user) {
          setAuthStatus('unauthorized');
          return;
        }

        try {
          // Verify authentication with backend (token in httpOnly cookie)
          const response = await api.get(endpoints.auth.verify);
          if (response.status === 200 && response.data.user) {
            setAuthStatus('authorized');
            // Update user data in case it changed
            sessionStorage.setItem("user", JSON.stringify(response.data.user));
          } else {
            setAuthStatus('unauthorized');
        sessionStorage.removeItem("user");
      }
        } catch (err) {
          setAuthStatus('unauthorized');
      sessionStorage.removeItem("user");
        }
      };

      verifyAuth();
    }, []);

    if (authStatus === 'checking') {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>;
    }

    if (authStatus === 'unauthorized') {
      return <Navigate to="/Admin" replace />;
    }

    return element;
  };

  return (
    <Routes>
      <Route path="/" element={<RequestConcern />} />
      <Route path="/print-monthly-reports" element={<PrintMonthlyReports />} />
      <Route path="/print-yearly-reports" element={<PrintYearlyReports />} />
      <Route path="/request-concern" element={<RequestConcern />} />
      <Route path="/Admin" element={<Login />} />
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