import { useCallback } from "react";
import { trpc } from "@/providers/trpc";

export function useAuth() {
  const { data: user, isLoading, error } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  const logout = useCallback(() => {
    // Clear session cookie
    document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    logoutMutation.mutate();
  }, [logoutMutation]);

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout,
  };
}
