"use client";

import { useState, useMemo, useEffect, useCallback, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { FloatingCart } from "@/components/layout/FloatingCart";
import { CategoryList } from "@/components/menu/CategoryList";
import { ProductGrid } from "@/components/menu/ProductGrid";
import { SearchBar } from "@/components/menu/SearchBar";
import { getCategories, getProducts, getTableByNumber, getMenu, getRestaurantMenu, getRestaurant } from "@/lib/api";
import { useTableStore } from "@/stores/tableStore";
import { useCartStore } from "@/stores/cartStore";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { useUIStore } from "@/stores/uiStore";
import { useToast } from "@/components/ui/Toast";
import type { Product, Category } from "@/types";

function MenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setTable = useTableStore((state) => state.setTable);
  const menuId = useTableStore((state) => state.menuId);
  const tableNumber = useTableStore((state) => state.tableNumber);
  const { mode, setMode, setTableNumber, selectedRestaurantId, selectedRestaurantName } = useOrderModeStore();
  const { items: cartItems, addItem, removeItem, updateQuantity } = useCartStore();
  const { gridView, setGridView } = useUIStore();
  const { showToast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurantMenuData, setRestaurantMenuData] = useState<{
    categories: Category[];
    products: Product[];
  } | null>(null);

  // Refs для скролла к категориям
  const categoryRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Обработать table и menu параметры из QR-кода
  const urlMenuId = searchParams.get("menu");
  const urlTableParam = searchParams.get("table");
  const urlRestaurantId = searchParams.get("restaurant");

  // Режим: QR-сканирование или выбор ресторана
  const isRestaurantMode = !!(urlRestaurantId || (selectedRestaurantId && mode !== "qr"));
  const effectiveRestaurantId = urlRestaurantId || selectedRestaurantId;

  // Используем menuId из URL если есть, иначе из store
  const effectiveMenuId = urlMenuId || menuId;

  // Load restaurant menu when in restaurant mode
  useEffect(() => {
    const loadRestaurantMenu = async () => {
      if (isRestaurantMode && effectiveRestaurantId) {
        try {
          const menuData = await getRestaurantMenu(effectiveRestaurantId);
          // Transform menu data to match existing format
          const categories: Category[] = menuData.categories.map((c) => ({
            id: c.id,
            name: c.name,
            icon: c.icon || "",
            sortOrder: c.sortOrder,
            isActive: true,
          }));
          const products: Product[] = menuData.categories.flatMap((c) =>
            c.products.map((p) => ({
              id: p.id,
              name: p.name,
              description: p.description || "",
              basePrice: p.basePrice,
              imageUrl: p.imageUrl || "",
              rating: 0,
              calories: 0,
              prepTimeMinutes: 0,
              isAvailable: p.isAvailable,
              categoryId: c.id,
            }))
          );
          setRestaurantMenuData({ categories, products });
        } catch (err) {
          console.error("Failed to load restaurant menu:", err);
        }
      }
    };

    loadRestaurantMenu();
  }, [isRestaurantMode, effectiveRestaurantId]);

  useEffect(() => {
    const loadData = async () => {
      // Skip if in restaurant mode
      if (isRestaurantMode) return;

      let tableData: any = null;
      let menuData: any = null;

      // Загрузить информацию о столе
      if (urlTableParam) {
        const tableNumber = parseInt(urlTableParam, 10);
        if (!isNaN(tableNumber)) {
          // Установить QR-режим при сканировании QR-кода
          setMode("qr");
          setTableNumber(tableNumber);

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
          restaurantPhone: tableData?.restaurantPhone,
          onlinePaymentAvailable: tableData?.onlinePaymentAvailable,
        });
      }
    };

    loadData();
  }, [urlTableParam, urlMenuId, setTable, setMode, setTableNumber, isRestaurantMode]);

  // Restore URL params from store if missing (e.g., after page refresh)
  useEffect(() => {
    // Only restore if we're in QR mode with table info in store but not in URL
    if (!urlTableParam && tableNumber && mode === "qr" && !isRestaurantMode) {
      const newUrl = `/menu?table=${tableNumber}${menuId ? `&menu=${menuId}` : ''}`;
      router.replace(newUrl);
    }
  }, [urlTableParam, tableNumber, menuId, mode, isRestaurantMode, router]);

  // Use API queries only when NOT in restaurant mode
  const { data: apiCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories", effectiveMenuId],
    queryFn: () => getCategories(effectiveMenuId || undefined),
    enabled: !isRestaurantMode,
  });

  const { data: apiProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products", selectedCategory, effectiveMenuId],
    queryFn: () => getProducts(selectedCategory || undefined, effectiveMenuId || undefined),
    enabled: !isRestaurantMode,
  });

  // Use restaurant menu data when in restaurant mode
  const categories = isRestaurantMode ? (restaurantMenuData?.categories || []) : apiCategories;
  const allProducts = isRestaurantMode ? (restaurantMenuData?.products || []) : apiProducts;

  // Показываем ВСЕ товары, не фильтруем по категории (непрерывный скролл)
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return allProducts;

    const query = searchQuery.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }, [allProducts, searchQuery]);

  // Скролл к категории вместо фильтрации
  const handleCategoryClick = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
    if (categoryId && categoryRefs.current.has(categoryId)) {
      const element = categoryRefs.current.get(categoryId);
      if (element) {
        const headerOffset = 180; // Отступ для header + категории
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  }, []);

  const isLoading = isRestaurantMode
    ? !restaurantMenuData
    : categoriesLoading || productsLoading;

  // Build a map of productId -> quantity from cart items
  const cartItemsMap = useMemo(() => {
    const map = new Map<string, number>();
    cartItems.forEach((item) => {
      const existing = map.get(item.productId) || 0;
      map.set(item.productId, existing + item.quantity);
    });
    return map;
  }, [cartItems]);

  // Add item to cart (or increase quantity if already in cart)
  const handleAdd = useCallback((product: Product) => {
    addItem({
      productId: product.id,
      productName: product.name,
      imageUrl: product.imageUrl,
      quantity: 1,
      unitPrice: product.basePrice,
      sizeId: undefined,
      sizeName: undefined,
      addonIds: [],
      addonNames: [],
      totalPrice: product.basePrice,
    });
  
  }, [addItem, showToast]);

  // Remove item from cart (or decrease quantity if more than 1)
  const handleRemove = useCallback((product: Product) => {
    const cartItem = cartItems.find((item) => item.productId === product.id);
    if (cartItem) {
      if (cartItem.quantity <= 1) {
        removeItem(cartItem.id);
        showToast(`${product.name} удалён`, "success");
      } else {
        updateQuantity(cartItem.id, cartItem.quantity - 1);
      }
    }
  }, [cartItems, removeItem, updateQuantity, showToast]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Меню" />

      <div className="space-y-4 py-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск блюд..."
          showViewToggle={true}
          gridView={gridView}
          onViewChange={setGridView}
        />

        {!isLoading && categories.length > 0 && (
          <CategoryList
            categories={categories}
            selectedId={selectedCategory}
            onSelect={handleCategoryClick}
          />
        )}

        <ProductGrid
          products={filteredProducts}
          categories={categories}
          categoryRefs={categoryRefs}
          isLoading={isLoading}
          cartItems={cartItemsMap}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
      </div>

      <FloatingCart />
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
