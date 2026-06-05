import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Home from './components/Home';
import HostCharger from './components/HostCharger';
import HostDashboard from './components/HostDashboard';
import Pricing from './components/Pricing';
import Support from './components/Support';
import StationDetails from './components/StationDetails';
import PaymentPage from './components/PaymentPage';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/host" element={<HostCharger />} />
              <Route path="/host-dashboard" element={<HostDashboard />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/support" element={<Support />} />
              <Route path="/station/:id" element={<StationDetails />} />
              <Route path="/payment" element={<PaymentPage />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
