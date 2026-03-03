import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type GridView = "1x1" | "2x2";

interface UIState {
  gridView: GridView;
  setGridView: (view: GridView) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      gridView: "2x2",
      setGridView: (view) => set({ gridView: view }),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
