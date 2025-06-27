import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [view, setView] = useState('dashboard'); // 'dashboard', 'profile', 'auth'

  useEffect(() => {
    if (!token) {
      setView('auth');
    } else {
      setView('dashboard');
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const renderView = () => {
    switch (view) {
      case 'auth':
        return <Auth setToken={setToken} setView={setView} />;
      case 'dashboard':
        return <Dashboard token={token} handleLogout={handleLogout} setView={setView} />;
      case 'profile':
        return <Profile token={token} setView={setView} />;
      default:
        return <Auth setToken={setToken} setView={setView} />;
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;