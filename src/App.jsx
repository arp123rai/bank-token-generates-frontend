import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import UserDashboard from './components/UserDashboard';
import AdminPanel from './components/AdminPanel';
import ManagerDashboard from './components/ManagerDashboard';
import Login from './components/Login';
import Signup from './components/Signup';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('username');
  const role = localStorage.getItem('role');

// Isse browser memory fresh ho jayegi aur Navbar turant updated state dikhayega.
  if (!token) return <Navigate to="/login" />;
  if (allowedRole && role !== allowedRole) {
    return <div className="text-center mt-20 font-bold text-red-600 font-sans uppercase tracking-widest">403: Access Denied</div>;
  }
  return children;
};

function App() {
  // 1. State banayein taaki React changes ko monitor kar sake
  const [authState, setAuthState] = useState({
    username: localStorage.getItem('username'),
    role: localStorage.getItem('role')
  });

  // 2. Navbar update karne ke liye function
  const refreshAuth = () => {
    setAuthState({
      username: localStorage.getItem('username'),
      role: localStorage.getItem('role')
    });
  };

  useEffect(() => {
    // Window storage ko listen karega (extra safety)
    window.addEventListener('storage', refreshAuth);
    return () => window.removeEventListener('storage', refreshAuth);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setAuthState({ username: null, role: null }); // State turant update karein
    window.location.href = "/login";
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-100 font-sans">
        
        <nav className="bg-white p-4 shadow-sm flex justify-between items-center px-10 border-b border-slate-200">
          <div className="flex space-x-6 items-center">
            <Link to="/" className="text-indigo-600 font-black text-2xl italic tracking-tighter">🏦 SMARTBANK</Link>
            <Link to="/" className="text-slate-500 font-bold text-sm hover:text-indigo-600 transition-colors uppercase tracking-widest">Token Desk</Link>
          </div>

        <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
  {/* Role Badges: Mobile par text chota aur padding kam kar di hai */}
  {authState.role === 'ROLE_STAFF' && (
    <Link to="/admin" className="text-emerald-600 font-black text-[10px] sm:text-sm uppercase tracking-widest bg-emerald-50 px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl whitespace-nowrap">
      <span className="sm:hidden">Staff</span> {/* Mobile par sirf 'Staff' */}
      <span className="hidden sm:inline">Staff Dashboard</span> {/* Desktop par full */}
    </Link>
  )}
  
  {authState.role === 'ROLE_MANAGER' && (
    <Link to="/manager" className="text-amber-600 font-black text-[10px] sm:text-sm uppercase tracking-widest bg-amber-50 px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl whitespace-nowrap">
      <span className="sm:hidden">Manager</span>
      <span className="hidden sm:inline">Manager Analytics</span>
    </Link>
  )}

  {!authState.username ? (
    <Link to="/login" className="bg-slate-900 text-white px-4 py-2 sm:px-8 sm:py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-600 transition-all text-[10px] sm:text-sm uppercase tracking-widest">
      Login
    </Link>
  ) : (
    <div className="flex items-center space-x-2 sm:space-x-4 animate-in fade-in duration-500">
      
      {/* Username Section: Mobile par hide ho jayega (screen < 640px) */}
      <div className="hidden sm:flex flex-col text-right">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Welcome back,</span>
        <span className="text-slate-800 font-black text-sm uppercase truncate max-w-[100px]">
          {authState.username}
        </span>
      </div>

      {/* Avatar: Size responsive kar diya hai */}
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex-shrink-0 flex items-center justify-center text-indigo-600 font-black border-2 border-indigo-200 text-xs sm:text-base">
        {authState.username.charAt(0).toUpperCase()}
      </div>

      {/* Logout/Exit Button */}
      <button 
        onClick={handleLogout} 
        className="bg-rose-50 text-rose-600 p-2 sm:p-2.5 rounded-lg sm:rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm flex-shrink-0"
        title="Logout"
      >
        <span className="font-black text-[10px] sm:text-xs">EXIT</span>
      </button>
    </div>
  )}
</div>
        </nav>

        <div className="p-4">
          <Routes>
            <Route path="/" element={<UserDashboard />} />
            {/* Login aur Signup ko refreshAuth pass kar sakte hain agar handleLogin wahi hai */}
            <Route path="/login" element={<Login onLoginSuccess={refreshAuth} />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/admin" element={
              <ProtectedRoute allowedRole="ROLE_STAFF">
                <AdminPanel />
              </ProtectedRoute>
            } />

            <Route path="/manager" element={
              <ProtectedRoute allowedRole="ROLE_MANAGER">
                <ManagerDashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;