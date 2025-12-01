import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api.js';
import { useToast } from '../components/ui/use-toast';

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const response = await apiClient.getCurrentUser();
          setAuthState({
            user: response.user,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch (error) {
          // Token is invalid, clear it
          apiClient.clearToken();
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    checkAuth();

    // Listen for external auth updates (e.g. wallet linked, profile changed)
    const onAuthUpdate = () => {
      checkAuth();
    };
    window.addEventListener('auth:update', onAuthUpdate);

    return () => {
      window.removeEventListener('auth:update', onAuthUpdate);
    };
  }, []);

  const login = async (credentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiClient.login(credentials);
      
      setAuthState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
      });
      // update user in state globally
      // nothing else to do here

      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.name}!`,
      });

      navigate('/dashboard');
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const register = async (data) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiClient.register(data);
      
      setAuthState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
      });

      toast({
        title: "Registration Successful",
        description: `Welcome to the platform, ${response.user.name}!`,
      });

      navigate('/dashboard');
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    navigate('/login');
  };

  return {
    ...authState,
    login,
    register,
    logout,
  };
};

