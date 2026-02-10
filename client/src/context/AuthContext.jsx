import { createContext, useState, useEffect, useContext } from 'react';
import { loginApi, registerApi, getMeApi } from '../api/authApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    getMeApi()
      .then(res => setUser(res.data.restaurant))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await loginApi(email, password);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.restaurant);
  };

  const register = async (name, email, password) => {
    const res = await registerApi(name, email, password);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.restaurant);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
