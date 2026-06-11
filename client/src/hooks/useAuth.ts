import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import { useAuth } from "../context/useAuth";

export const useMe = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data.user;
    },
    enabled: isAuthenticated, // sirf login pe fetch karo
    staleTime: 10 * 60 * 1000, // 10 min cache
  });
};

export const useDeleteAccount = () => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete("/auth/delete-account");
    },
    onSuccess: () => {
      queryClient.clear(); // sab cache clear karo
      logout();
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/resend-verification");
    },
  });
};

export const useLogin = () => {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const res = await api.post("/auth/login", { email, password });
      return res.data;
    },
    onSuccess: (data) => {
      login(data.accessToken, data.user);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
};

export const useRegister = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => {
      const res = await api.post("/auth/register", { name, email, password });
      return res.data;
    },
    onSuccess: (data) => {
      login(data.accessToken, data.user);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      await api.post("/auth/forgot-password", { email });
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => {
      await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      await api.post("/auth/verify-email", { token });
    },
  });
};
