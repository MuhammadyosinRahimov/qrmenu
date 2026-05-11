import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { sendOtp as apiSendOtp, verifyOtp as apiVerifyOtp, loginTelegram as apiLoginTelegram } from "@/lib/api";
import type { TelegramAuthPayload } from "@/types";

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

interface AuthState {
  token: string | null;
  userId: string | null;
  phone: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  loginWithTelegram: (payload: TelegramAuthPayload) => Promise<void>;
  setAuth: (data: { token: string; userId: string; phone: string | null }) => void;
  setPhone: (phone: string | null) => void;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      phone: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      sendOtp: async (phone) => {
        set({ isLoading: true, error: null });
        try {
          await apiSendOtp(phone);
          set({ isLoading: false });
        } catch (err) {
          set({ isLoading: false, error: "Ошибка отправки SMS. Попробуйте снова." });
          throw err;
        }
      },

      verifyOtp: async (phone, code) => {
        set({ isLoading: true, error: null });
        try {
          const resp = await apiVerifyOtp(phone, code);
          if (typeof window !== "undefined") localStorage.setItem("token", resp.token);
          set({
            token: resp.token,
            userId: resp.userId,
            phone: resp.phone,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false, error: "Неверный код. Попробуйте снова." });
          throw err;
        }
      },

      loginWithTelegram: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const resp = await apiLoginTelegram(payload);
          if (typeof window !== "undefined") localStorage.setItem("token", resp.token);
          set({
            token: resp.token,
            userId: resp.userId,
            phone: resp.phone,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({ isLoading: false, error: "Не удалось войти через Telegram" });
          throw err;
        }
      },

      setAuth: ({ token, userId, phone }) => {
        if (typeof window !== "undefined") localStorage.setItem("token", token);
        set({ token, userId, phone, isAuthenticated: true });
      },

      setPhone: (phone) => set({ phone }),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("auth-storage");
        }
        set({ token: null, userId: null, phone: null, isAuthenticated: false });
      },

      clearError: () => set({ error: null }),

      checkAuth: () => {
        const state = get();
        if (state.token && isTokenExpired(state.token)) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("auth-storage");
          }
          set({ token: null, userId: null, phone: null, isAuthenticated: false });
          return false;
        }
        return state.isAuthenticated;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        token: state.token,
        userId: state.userId,
        phone: state.phone,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
