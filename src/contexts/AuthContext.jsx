import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);

  // Load user data and tokens from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (savedUser && accessToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Check if tokens are still valid
        checkTokenValidity();
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        clearAllAuthData();
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Check token validity and refresh if needed
  const checkTokenValidity = async () => {
    try {
      const authStatus = await apiService.checkAuthStatus();
      if (authStatus.authenticated) {
        setSessions(authStatus.data?.sessions || []);
        setLoading(false);
      } else {
        // Try to refresh token
        await refreshTokens();
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      clearAllAuthData();
    }
  };

  // Refresh tokens automatically
  const refreshTokens = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const data = await apiService.refreshTokens();
        if (data.access_token) {
          localStorage.setItem('accessToken', data.access_token);
          localStorage.setItem('token', data.access_token);
        }
        if (data.refresh_token) {
          localStorage.setItem('refreshToken', data.refresh_token);
        }
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAllAuthData();
    }
    return false;
  };

  // Clear all authentication data
  const clearAllAuthData = () => {
    setUser(null);
    setIsAuthenticated(false);
    setSessions([]);
    // Clear all possible token storage keys
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refresh_token');
    setLoading(false);
  };

  const login = async (userData, tokens) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Store tokens if provided
    if (tokens) {
      if (tokens.access_token) {
        localStorage.setItem('accessToken', tokens.access_token);
        localStorage.setItem('token', tokens.access_token);
      }
      if (tokens.refresh_token) {
        localStorage.setItem('refreshToken', tokens.refresh_token);
      }
      
      // Fetch complete user profile after login to get name and other details
      // Only fetch if we have tokens (authenticated request)
      try {
        const profileData = await apiService.getUserProfile();
        if (profileData) {
          // Merge profile data with existing user data
          const updatedUserData = {
            ...userData,
            // Use profile name if available
            name: profileData.profile?.name || 
                  profileData.profile?.company_name || 
                  userData.name || 
                  "User",
            // Update email if available from profile
            email: profileData.user?.email || userData.email,
            // Update profile-specific fields
            ...(profileData.profile || {}),
            // Keep user type info
            user_type: profileData.user?.user_type || userData.user_type,
            user_type_name: profileData.user?.user_type_name || userData.profession
          };
          setUser(updatedUserData);
          localStorage.setItem('user', JSON.stringify(updatedUserData));
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Continue with existing userData if profile fetch fails
      }
      
      // Load sessions after login
      try {
        const authStatus = await apiService.checkAuthStatus();
        if (authStatus.authenticated) {
          setSessions(authStatus.data?.sessions || []);
        }
      } catch (error) {
        console.error('Failed to load sessions:', error);
      }
    }
  };

  const logout = async () => {
    try {
      // Call API logout endpoint
      await apiService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      clearAllAuthData();
    }
  };

  const signup = async (userData, tokens) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Store tokens if provided
    if (tokens) {
      if (tokens.access_token) {
        localStorage.setItem('accessToken', tokens.access_token);
        localStorage.setItem('token', tokens.access_token);
      }
      if (tokens.refresh_token) {
        localStorage.setItem('refreshToken', tokens.refresh_token);
      }
    }
    
    // Load sessions after signup
    try {
      const authStatus = await apiService.checkAuthStatus();
      if (authStatus.authenticated) {
        setSessions(authStatus.data?.sessions || []);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  // Session management functions
  const loadSessions = async () => {
    try {
      const sessionsData = await apiService.getActiveSessions();
      setSessions(sessionsData.sessions || []);
      return sessionsData;
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return null;
    }
  };

  const terminateSession = async (sessionId) => {
    try {
      await apiService.deleteSession(sessionId);
      await loadSessions(); // Reload sessions
    } catch (error) {
      console.error('Failed to terminate session:', error);
      throw error;
    }
  };

  const terminateAllSessions = async () => {
    try {
      await apiService.terminateAllSessions();
      await loadSessions(); // Reload sessions
    } catch (error) {
      console.error('Failed to terminate all sessions:', error);
      throw error;
    }
  };

  // Profile update function
  const updateProfile = async (profileData) => {
    try {
      const updatedProfile = await apiService.updateUserProfile(profileData);
      setUser(prev => ({ ...prev, ...updatedProfile }));
      localStorage.setItem('user', JSON.stringify({ ...user, ...updatedProfile }));
      return updatedProfile;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    sessions,
    login,
    logout,
    signup,
    loadSessions,
    terminateSession,
    terminateAllSessions,
    updateProfile,
    refreshTokens,
    clearAllAuthData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
