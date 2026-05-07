import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface UIState {
  isOffline: boolean;
  toasts: Toast[];
  liveSyncEnabled: boolean;
  setOffline: (isOffline: boolean) => void;
  setLiveSyncEnabled: (enabled: boolean) => void;
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isOffline: false,
  toasts: [],
  liveSyncEnabled: false, // Default to false in Phase 1

  setOffline: (isOffline) => set({ isOffline }),

  setLiveSyncEnabled: (liveSyncEnabled) => set({ liveSyncEnabled }),

  addToast: (message, type = "info") =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: Math.random().toString(36).substring(2, 9), message, type },
      ],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
