import { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User, SignInData, SignUpData } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (data: SignInData) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  sessionId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(
    localStorage.getItem("sessionId")
  );
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user/me"],
    enabled: !!sessionId,
    retry: false,
  });

  useEffect(() => {
    // Set authorization header for API requests
    if (sessionId) {
      queryClient.setDefaultOptions({
        queries: {
          ...queryClient.getDefaultOptions().queries,
          meta: { sessionId },
        },
        mutations: {
          ...queryClient.getDefaultOptions().mutations,
          meta: { sessionId },
        },
      });
    }
  }, [sessionId, queryClient]);

  const signInMutation = useMutation({
    mutationFn: async (data: SignInData) => {
      const response = await apiRequest("POST", "/api/auth/signin", data);
      return response.json();
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      localStorage.setItem("sessionId", data.sessionId);
      queryClient.setQueryData(["/api/user/me"], data.user);
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpData) => {
      const response = await apiRequest("POST", "/api/auth/signup", data);
      return response.json();
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      localStorage.setItem("sessionId", data.sessionId);
      queryClient.setQueryData(["/api/user/me"], data.user);
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      if (sessionId) {
        await apiRequest("POST", "/api/auth/logout", undefined);
      }
    },
    onSettled: () => {
      setSessionId(null);
      localStorage.removeItem("sessionId");
      queryClient.clear();
    },
  });

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    signIn: signInMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    sessionId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
