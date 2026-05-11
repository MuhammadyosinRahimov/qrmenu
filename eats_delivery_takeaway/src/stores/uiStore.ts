import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type GridView = "1x1" | "2x2";

interface UIState {
  gridView: GridView;
  setGridView: (view: GridView) => void;
  // Address picker modal (not persisted)
  addressModalOpen: boolean;
  openAddressModal: () => void;
  closeAddressModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      gridView: "2x2",
      setGridView: (view) => set({ gridView: view }),
      addressModalOpen: false,
      openAddressModal: () => set({ addressModalOpen: true }),
      closeAddressModal: () => set({ addressModalOpen: false }),
    }),
    {
      name: "ui-storage-eats",
      storage: createJSONStorage(() => localStorage),
      // Don't persist transient modal state
      partialize: (state) => ({ gridView: state.gridView }) as UIState,
    }
  )
);
