"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { CategoryList } from "@/components/menu/CategoryList";
import { ProductGrid } from "@/components/menu/ProductGrid";
import { SearchBar } from "@/components/menu/SearchBar";
import { getCategories, getProducts, getTableByNumber } from "@/lib/api";
import { useTableStore } from "@/stores/tableStore";

export default function MenuPage() {
  const searchParams = useSearchParams();
  const setTable = useTableStore((state) => state.setTable);
  const tableId = useTableStore((state) => state.tableId);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Обработать table параметр из QR-кода
  useEffect(() => {
    const tableParam = searchParams.get("table");

    // Если есть table параметр и стол ещё не загружен
    if (tableParam && !tableId) {
      const tableNumber = parseInt(tableParam, 10);
      if (!isNaN(tableNumber)) {
        getTableByNumber(tableNumber)
          .then((table) => {
            setTable({
              id: table.id,
              number: table.number,
              restaurantId: table.restaurantId,
              restaurantName: table.restaurantName,
              menuId: table.menuId,
              menuName: table.menuName,
            });
          })
          .catch((err) => {
            console.error("Failed to load table:", err);
            // Сохранить хотя бы номер стола
            setTable({ id: `table-${tableNumber}`, number: tableNumber });
          });
      }
    }
  }, [searchParams, setTable, tableId]);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products", selectedCategory],
    queryFn: () => getProducts(selectedCategory || undefined),
  });

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Меню" />

      <div className="space-y-4 py-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск блюд..."
        />

        {!categoriesLoading && (
          <CategoryList
            categories={categories}
            selectedId={selectedCategory}
            onSelect={setSelectedCategory}
          />
        )}

        <ProductGrid
          products={filteredProducts}
          isLoading={productsLoading || categoriesLoading}
        />
      </div>

      <BottomNav />
    </div>
  );
}
