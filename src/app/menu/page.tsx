"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { CategoryList } from "@/components/menu/CategoryList";
import { ProductGrid } from "@/components/menu/ProductGrid";
import { SearchBar } from "@/components/menu/SearchBar";
import { getCategories, getProducts, getTableByNumber, getMenu } from "@/lib/api";
import { useTableStore } from "@/stores/tableStore";

function MenuContent() {
  const searchParams = useSearchParams();
  const setTable = useTableStore((state) => state.setTable);
  const tableId = useTableStore((state) => state.tableId);
  const menuId = useTableStore((state) => state.menuId);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Обработать table и menu параметры из QR-кода
  const urlMenuId = searchParams.get("menu");
  const urlTableParam = searchParams.get("table");

  // Используем menuId из URL если есть, иначе из store
  const effectiveMenuId = urlMenuId || menuId;

  useEffect(() => {
    const loadData = async () => {
      let tableData: any = null;
      let menuData: any = null;

      // Загрузить информацию о столе
      if (urlTableParam) {
        const tableNumber = parseInt(urlTableParam, 10);
        if (!isNaN(tableNumber)) {
          try {
            tableData = await getTableByNumber(tableNumber);
          } catch (err) {
            console.error("Failed to load table:", err);
            tableData = { id: `table-${tableNumber}`, number: tableNumber };
          }
        }
      }

      // Если есть menuId в URL - загрузить информацию о меню
      if (urlMenuId) {
        try {
          menuData = await getMenu(urlMenuId);
        } catch (err) {
          console.error("Failed to load menu:", err);
        }
      }

      // Обновить store
      if (tableData || menuData) {
        setTable({
          id: tableData?.id || `menu-${urlMenuId}`,
          number: tableData?.number || 0,
          restaurantId: menuData?.restaurantId || tableData?.restaurantId,
          restaurantName: menuData?.restaurantName || tableData?.restaurantName,
          menuId: urlMenuId || tableData?.menuId,
          menuName: menuData?.name || tableData?.menuName,
        });
      }
    };

    loadData();
  }, [urlTableParam, urlMenuId, setTable]);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories", effectiveMenuId],
    queryFn: () => getCategories(effectiveMenuId || undefined),
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products", selectedCategory, effectiveMenuId],
    queryFn: () => getProducts(selectedCategory || undefined, effectiveMenuId || undefined),
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

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <MenuContent />
    </Suspense>
  );
}
