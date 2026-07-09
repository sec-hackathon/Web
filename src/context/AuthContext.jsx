import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../api/services';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 앱 실행 시 토큰이 있으면 유저 정보 가져오기
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await authService.getMe();
          setUser(res.data);
        } catch (e) {
          localStorage.clear();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (data) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser({
      memberId: data.memberId,
      username: data.username,
      email: data.email,
      phone: data.phone
    });
  };

  const logout = async () => {
    try { await authService.logout(); } catch (e) {}
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);