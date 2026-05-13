import { create } from "zustand";

interface SettingsState {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  hapticsEnabled: true,
  soundEnabled: false,
  setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
}));
