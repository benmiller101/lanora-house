import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        // Try to get user from session first
        const response = await fetch("/api/auth/user", {
          credentials: "include",
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log("Session auth successful:", userData);
          return userData;
        }
        
        console.log("No authentication found");
        return null; // Return null instead of throwing
      } catch (err) {
        console.log("Auth check failed:", err);
        return null; // Return null on any error
      }
    },
    retry: false,
    staleTime: 30 * 1000, // 30 seconds 
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const refetch = () => {
    return queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch,
  };
}