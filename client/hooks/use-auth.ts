"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi, type LoginPayload, type RegisterPayload } from "@/lib/auth.api";
import { useAuthStore } from "@/store/auth.store";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.push("/dashboard");
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: () => {
      router.push("/login");
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      router.push("/login");
    },
    onError: () => {
      // Even if server errors, clear local state
      clearAuth();
      router.push("/login");
    },
  });
}

export function useUpdateProfile() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  return useMutation({
    mutationFn: (payload: { name: string }) => authApi.updateProfile(payload),
    onSuccess: (data) => {
      // We need to keep tokens while updating user
      if (accessToken && refreshToken) {
        setAuth(data.user, accessToken, refreshToken);
      }
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: any) => authApi.changePassword(payload),
  });
}
