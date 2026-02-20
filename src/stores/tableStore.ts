import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TableState {
  tableId: string | null;
  tableNumber: number | null;
  setTable: (id: string, number: number) => void;
  clearTable: () => void;
}

export const useTableStore = create<TableState>()(
  persist(
    (set) => ({
      tableId: null,
      tableNumber: null,
      setTable: (id, number) => set({ tableId: id, tableNumber: number }),
      clearTable: () => set({ tableId: null, tableNumber: null }),
    }),
    {
      name: "table-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
