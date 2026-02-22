import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TableData {
  id: string;
  number: number;
  restaurantId?: string;
  restaurantName?: string;
  menuId?: string;
  menuName?: string;
}

interface TableState {
  tableId: string | null;
  tableNumber: number | null;
  restaurantId: string | null;
  restaurantName: string | null;
  menuId: string | null;
  menuName: string | null;
  setTable: (data: TableData) => void;
  clearTable: () => void;
}

export const useTableStore = create<TableState>()(
  persist(
    (set) => ({
      tableId: null,
      tableNumber: null,
      restaurantId: null,
      restaurantName: null,
      menuId: null,
      menuName: null,
      setTable: (data) =>
        set({
          tableId: data.id,
          tableNumber: data.number,
          restaurantId: data.restaurantId || null,
          restaurantName: data.restaurantName || null,
          menuId: data.menuId || null,
          menuName: data.menuName || null,
        }),
      clearTable: () =>
        set({
          tableId: null,
          tableNumber: null,
          restaurantId: null,
          restaurantName: null,
          menuId: null,
          menuName: null,
        }),
    }),
    {
      name: "table-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
