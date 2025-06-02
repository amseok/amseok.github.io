import { createContext, useEffect, useState } from 'react';
import ApiService from '../services/ApiService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    // Check for existing authentication on app start
    const initAuth = async () => {
      try {
        const storedUser = ApiService.getStoredUser();
        const token = localStorage.getItem('dreamjournal_token');
        
        if (token && storedUser) {
          // Set user data from localStorage first (immediate UI update)
          setUser(storedUser);
          setIsAuthenticated(true);
          
          // Then verify token is still valid in the background
          try {
            const response = await ApiService.getProfile();
            // Update with fresh data from server
            setUser(response.user || response);
          } catch (error) {
            console.warn('Token verification failed:', error);
            // Only clear auth if it's a 401 (unauthorized) error
            if (error.message?.includes('401') || error.message?.includes('Authentication required')) {
              console.log('Token expired, clearing auth');
              ApiService.clearAuth();
              setUser(null);
              setIsAuthenticated(false);
            }
            // For network errors, keep using stored data
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth events
    const handleLogin = (event) => {
      setUser(event.detail?.user || ApiService.getStoredUser());
      setIsAuthenticated(true);
    };

    const handleLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:login', handleLogin);
    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:login', handleLogin);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await ApiService.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, name) => {
    setLoading(true);
    try {
      const response = await ApiService.signup(email, password, name);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await ApiService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };
  const updateProfile = async (profileData) => {
    const response = await ApiService.updateProfile(profileData);
    // Extract user data from response (backend returns {message, user})
    const updatedUser = response.user || response;
    setUser(updatedUser);
    
    // Also update localStorage to keep data in sync
    localStorage.setItem('dreamjournal_user', JSON.stringify(updatedUser));
    
    return updatedUser;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
