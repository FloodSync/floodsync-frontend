import { create } from "zustand";
import { User } from "@/lib/api/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  hydrate: () => Promise<void>;
}

const STORAGE_KEY = "@floodsync:auth";

const getAsyncStorage = () => {
  try {
    return require("@react-native-async-storage/async-storage").default;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: async (user, token) => {
    set({ user, token, isAuthenticated: true });
    const AsyncStorage = getAsyncStorage();
    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ user, token, isAuthenticated: true })
        );
      } catch {
        // Silent fail
      }
    }
  },
  clearAuth: async () => {
    set({ user: null, token: null, isAuthenticated: false });
    const AsyncStorage = getAsyncStorage();
    if (AsyncStorage) {
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } catch {
        // Silent fail
      }
    }
  },
  hydrate: async () => {
    const AsyncStorage = getAsyncStorage();
    if (!AsyncStorage) return;
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          user: parsed.user,
          token: parsed.token,
          isAuthenticated: parsed.isAuthenticated,
        });
      }
    } catch {
      // Silent fail
    }
  },
}));
