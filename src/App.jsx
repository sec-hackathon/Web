import React, { useState } from 'react';
import Home from './pages/Home';
import MapResults from './pages/MapResults';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState('home');
  const [searchParams, setSearchParams] = useState({ location: '', data: null });
  const [isSigningUp, setIsSigningUp] = useState(false);

  if (loading) return null;

  // 1. 로그인이 안 되어 있으면 로그인 화면
  if (!user) {
    return isSigningUp 
      ? <Signup onSwitchToLogin={() => setIsSigningUp(false)} />
      : <Login onSwitchToSignup={() => setIsSigningUp(true)} />;
  }

  // 2. 로그인 되어 있으면 홈 또는 결과 화면
  const handleSearch = (location, data) => {
    setSearchParams({ location, data });
    setView('results');
  };

  return (
    <div className="min-h-screen bg-white">
      {view === 'home' ? (
        <Home onSearch={handleSearch} />
      ) : (
        <MapResults 
          params={searchParams} 
          onGoBack={() => setView('home')} 
        />
      )}
    </div>
  );
}

export default App;