import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// Import Real Pages
import Dashboard from './pages/Dashboard';
import LiveEntry from './pages/LiveEntry';
import Members from './pages/Members';
import Logs from './pages/Logs';
import ConsentRecords from './pages/ConsentRecords';
import Settings from './pages/Settings';
import Architecture from './pages/Architecture';
import Landing from './pages/Landing'; // NEW
import AIAgent from './pages/AIAgent';

import './App.css';

// Layout wrapper for dashboard areas
const AppLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page Route */}
        <Route path="/" element={<Landing />} />

        {/* Dashboard Routes wrapped in AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/live-entry" element={<LiveEntry />} />
          <Route path="/members" element={<Members />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/consent-records" element={<ConsentRecords />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/ai-agent" element={<AIAgent />} />

        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
