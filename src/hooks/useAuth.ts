'use client';

import { useState, useCallback } from 'react';
import type { UserRole } from '@/types';

export function useAuth() {
  // Use function initializers to read from localStorage immediately
  const [email, setEmail] = useState<string | null>(() => 
    typeof window !== 'undefined' ? localStorage.getItem('user_email') : null
  );
  
  const [token, setToken] = useState<string | null>(() => 
    typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  );
  
  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('user_role');
      return (savedRole === 'admin' || savedRole === 'customer') ? savedRole : 'customer';
    }
    return 'customer';
  });

  // Since we initialized state directly, we don't need a useEffect to set it.
  // We can just set loading to false immediately.
  const [loading, setLoading] = useState(false);

  const login = useCallback((userEmail: string, authToken: string, userRole: UserRole = 'customer') => {
    localStorage.setItem('user_email', userEmail);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user_role', userRole);
    
    setEmail(userEmail);
    setToken(authToken);
    setRole(userRole);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user_email');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    
    setEmail(null);
    setToken(null);
    setRole('customer');
  }, []);

  const getAuthHeaders = useCallback((): HeadersInit => {
    // We prefer the state token, fallback to localStorage if needed
    const t = token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
    return t ? { Authorization: `Bearer ${t}` } : {};
  }, [token]);

  return {
    email,
    token,
    role,
    loading,
    isAuthenticated: !!email,
    isAdmin: role === 'admin',
    login,
    logout,
    getAuthHeaders,
  };
}