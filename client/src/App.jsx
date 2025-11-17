import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Request from "./user/pages/Request.jsx"
import PrintPanelMonth from "./pages/PrintPanelMonth.jsx"
import PrintPanelYear from "./pages/PrintPanelYear.jsx"
import PrintPanelQuarterly from "./pages/PrintPanelQuarterly.jsx";
import ServiceRequest from "./pages/ItServiceRequestForm.jsx"
import ServiceRequest1 from "./pages/ItServiceRequestForm1.jsx"
import Login from "./pages/Login.jsx"

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const ProtectedRoute = ({ element }) => {
    const token = localStorage.getItem("token");
    return token ? element : <Navigate to="/Admin" />;
  };

  return (
    <>
      <BrowserRouter basename="/NDC_RMS">
        <Routes>
          <Route path="/" element={<Request/>}/>
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard/>}/>}/> 
          <Route path="/print-Monthly-Report" element={<PrintPanelMonth />} />
          <Route path="/print-Yearly-Report" element={<PrintPanelYear />} />
          <Route path="/print-Quarterly-Report" element={<PrintPanelQuarterly />} />
          <Route path="/request-forms" element={<ServiceRequest/>}/>
          <Route path="/request-forms1" element={<ServiceRequest1/>}/>
          <Route path="/Admin" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login/>} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
