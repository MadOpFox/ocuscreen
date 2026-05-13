import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";

export interface AuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  principal: string | null;
  login: () => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  const {
    login,
    clear,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    identity,
  } = useInternetIdentity();
  const queryClient = useQueryClient();

  const principal = identity ? identity.getPrincipal().toString() : null;

  const logout = () => {
    clear();
    queryClient.clear();
  };

  return {
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    principal,
    login,
    logout,
  };
}
