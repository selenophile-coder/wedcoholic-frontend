import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('wedcoholic_user');
    const storedToken = localStorage.getItem('wedcoholic_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.requireStage2) {
        setIsLoading(false);
        return { requireStage2: true };
      }

      setUser(data);
      setToken(data.token);
      localStorage.setItem('wedcoholic_user', JSON.stringify(data));
      localStorage.setItem('wedcoholic_token', data.token);
      setIsLoading(false);
      return { success: true, user: data };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { error: err.message };
    }
  };

  const verifyStage2 = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/verify-stage2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Super Admin verification failed');
      }

      setUser(data);
      setToken(data.token);
      localStorage.setItem('wedcoholic_user', JSON.stringify(data));
      localStorage.setItem('wedcoholic_token', data.token);
      setIsLoading(false);
      return { success: true, user: data };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { error: err.message };
    }
  };

  const signup = async (name, email, phone, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      setIsLoading(false);
      return { success: true, email: data.email, otpFallback: data.otpFallback };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { error: err.message };
    }
  };

  const verifyOtp = async (email, otp) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      setUser(data);
      setToken(data.token);
      localStorage.setItem('wedcoholic_user', JSON.stringify(data));
      localStorage.setItem('wedcoholic_token', data.token);
      setIsLoading(false);
      return { success: true, user: data };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('wedcoholic_user');
    localStorage.removeItem('wedcoholic_token');
  };

  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        isAdmin,
        login,
        verifyStage2,
        signup,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
