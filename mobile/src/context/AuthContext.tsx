/**
 * Auth Context for React Native
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { login, register, logout, fetchProfile, clearError } from '../store/slices/authSlice';
import { tokenStorage } from '../api';
import type { User, LoginCredentials, RegisterData } from '../api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = await tokenStorage.getToken();
      if (token) {
        try {
          await dispatch(fetchProfile()).unwrap();
        } catch {
          // Token invalid, clear it
          await tokenStorage.clearTokens();
        }
      }
      setIsInitialized(true);
    };

    checkAuth();
  }, [dispatch]);

  const signIn = async (credentials: LoginCredentials) => {
    await dispatch(login(credentials)).unwrap();
  };

  const signUp = async (data: RegisterData) => {
    await dispatch(register(data)).unwrap();
  };

  const signOut = async () => {
    await dispatch(logout());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  // Show loading while checking initial auth state
  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        signIn,
        signUp,
        signOut,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;



