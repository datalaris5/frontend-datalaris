import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage on mount
    const storedUser = localStorage.getItem('datalaris_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Ensure subscription field exists for legacy data
      if (!parsedUser.subscription) {
        parsedUser.subscription = 'starter';
      }
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock login logic
    // In a real app, this would call the API
    
    let role = 'owner';
    let subscription = 'starter';
    let name = 'Demo User';

    if (email === 'admin@datalaris.com') {
      role = 'admin';
      subscription = 'pro';
      name = 'Super Admin';
    } else if (email === 'pro@datalaris.com') {
      subscription = 'pro';
      name = 'Pro User';
    } else if (email === 'starter@datalaris.com') {
      subscription = 'starter';
      name = 'Starter User';
    }

    const mockUser = {
      id: '1',
      email: email,
      name: name,
      role: role,
      subscription: subscription
    };
    
    setUser(mockUser);
    localStorage.setItem('datalaris_user', JSON.stringify(mockUser));
    return true;
  };

  const register = (name, email, password) => {
    const mockUser = {
      id: '1',
      email: email,
      name: name,
      role: 'owner',
      subscription: 'starter' // Default plan
    };
    setUser(mockUser);
    localStorage.setItem('datalaris_user', JSON.stringify(mockUser));
    return true;
  };

  const upgradeSubscription = (planId) => {
    if (!user) return;
    const updatedUser = { ...user, subscription: planId };
    setUser(updatedUser);
    localStorage.setItem('datalaris_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('datalaris_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, upgradeSubscription, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
