import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Admin, AuthState } from '../types/models';
import { authService, initializeLocalStorage } from '../utils/localStorage';

interface AuthContextType {
  authState: AuthState;
  loginUser: (email: string, password: string) => Promise<boolean>;
  loginAdmin: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    admin: null,
    role: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize mock data in localStorage
    initializeLocalStorage();
    
    // Check if user is already logged in
    const storedAuthState = authService.getAuthState();
    setAuthState(storedAuthState);
    setIsLoading(false);
  }, []);

  const loginUser = async (email: string, password: string): Promise<boolean> => {
    const authResult = authService.loginUser(email, password);
    if (authResult) {
      setAuthState(authResult);
      return true;
    }
    return false;
  };

  const loginAdmin = async (username: string, password: string): Promise<boolean> => {
    const authResult = authService.loginAdmin(username, password);
    if (authResult) {
      setAuthState(authResult);
      return true;
    }
    return false;
  };

  const logout = () => {
    authService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      admin: null,
      role: null
    });
  };

  return (
    <AuthContext.Provider value={{ authState, loginUser, loginAdmin, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};