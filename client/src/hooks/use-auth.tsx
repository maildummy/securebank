import { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User, SignInData, SignUpData } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (data: SignInData) => Promise<any>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  sessionId: string | null;
  checkAdminLoginStatus: (attemptId: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(
    localStorage.getItem("sessionId")
  );
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user/me"],
    enabled: !!sessionId,
    retry: false,
    meta: { sessionId },
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
      try {
      const response = await apiRequest("POST", "/api/auth/signin", data);
        return await response.json();
      } catch (error) {
        // apiRequest will already throw an error with the proper message
        throw error;
      }
    },
    onSuccess: (data) => {
      // Standard login flow - no admin approval check needed
      setSessionId(data.sessionId);
      localStorage.setItem("sessionId", data.sessionId);
      queryClient.setQueryData<User>(["/api/user/me"], data.user);
      
      return data;
    },
  });

  const checkAdminLoginStatus = async (attemptId: string) => {
    try {
      const response = await fetch(`/api/auth/admin-login/${attemptId}`, {
        headers: {
          "Authorization": sessionId ? `Bearer ${sessionId}` : '',
        }
      });
      const data = await response.json();
      
      if (data.status === "approved") {
        setSessionId(data.sessionId);
        localStorage.setItem("sessionId", data.sessionId);
        queryClient.setQueryData<User>(["/api/user/me"], data.user);
      }
      
      return data;
    } catch (error) {
      console.error("Failed to check login status", error);
      throw error;
    }
  };

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpData) => {
      try {
      const response = await apiRequest("POST", "/api/auth/signup", data);
        return await response.json();
      } catch (error) {
        // apiRequest will already throw an error with the proper message
        throw error;
      }
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      localStorage.setItem("sessionId", data.sessionId);
      queryClient.setQueryData<User>(["/api/user/me"], data.user);
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      if (sessionId) {
        const headers = { "Authorization": `Bearer ${sessionId}` };
        await apiRequest("POST", "/api/auth/logout", undefined, headers);
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
    checkAdminLoginStatus,
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
