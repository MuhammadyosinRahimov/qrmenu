"use client";

import { useMemo, useState, use } from "react";
import { AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { FloatingCart } from "@/components/layout/FloatingCart";
import { RestaurantHeroHeader } from "@/components/restaurant/RestaurantHeroHeader";
import { RestaurantInfoBlock } from "@/components/restaurant/RestaurantInfoBlock";
import { RestaurantStatusModal } from "@/components/restaurant/RestaurantStatusModal";
import { CategoryPills } from "@/components/menu/CategoryPills";
import { ProductGrid } from "@/components/menu/ProductGrid";
import { ProductSheet } from "@/components/menu/ProductSheet";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { FullscreenSearch } from "@/components/search/FullscreenSearch";
import { getRestaurant, getRestaurantMenu } from "@/lib/api";
import { useCartStore } from "@/stores/cartStore";
import type { MenuProduct } from "@/types";

export default function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = use(params);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [productOpen, setProductOpen] = useState<MenuProduct | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const { data: restaurant } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => getRestaurant(restaurantId),
  });
  const { data: menu, isLoading } = useQuery({
    queryKey: ["menu", restaurantId],
    queryFn: () => getRestaurantMenu(restaurantId),
  });

  const closed = restaurant?.acceptingOrders === false;

  const cartItemsMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of items) {
      map.set(i.productId, (map.get(i.productId) || 0) + i.quantity);
    }
    return map;
  }, [items]);

  const onSelectCat = (id: string) => {
    setActiveCat(id);
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAdd = (p: MenuProduct) => {
    // Products with multiple sizes require explicit selection — open the
    // customization sheet so the customer picks a size.
    if (p.sizes.length > 1) {
      setProductOpen(p);
      return;
    }
    const defaultSize = p.sizes.find((s) => s.isDefault) ?? p.sizes[0] ?? null;
    const unitPrice = p.basePrice + (defaultSize?.priceModifier ?? 0);
    addItem({
      productId: p.id,
      restaurantId,
      productName: p.name,
      imageUrl: p.imageUrl,
      sizeId: defaultSize?.id,
      sizeName: defaultSize?.name,
      addonIds: [],
      addonNames: [],
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice,
    });
  };

  const handleRemove = (p: MenuProduct) => {
    const defaultSize = p.sizes.find((s) => s.isDefault) ?? p.sizes[0] ?? null;
    const id = `${p.id}-${defaultSize?.id || "default"}-`;
    const found = items.find((i) => i.id === id);
    if (!found) return;
    updateQuantity(id, found.quantity - 1);
  };

  return (
    <div className="min-h-dvh pb-20 bg-surface">
      <Header title={restaurant?.name} hideAddress />

      {restaurant && <RestaurantHeroHeader restaurant={restaurant} />}
      {restaurant && <RestaurantInfoBlock restaurant={restaurant} />}

      {menu && menu.categories.length > 0 && (
        <>
          <div className="px-4 pt-1 pb-2">
            <SearchTrigger
              placeholder="Поиск по меню"
              onClick={() => setSearchOpen(true)}
            />
          </div>
          <CategoryPills
            categories={menu.categories}
            activeId={activeCat ?? menu.categories[0]?.id}
            onSelect={onSelectCat}
          />
          <ProductGrid
            categories={menu.categories}
            query=""
            cartItems={cartItemsMap}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onOpen={(p) => setProductOpen(p)}
          />
        </>
      )}

      {isLoading && (
        <div className="p-8 text-center text-muted text-sm">Загрузка меню...</div>
      )}

      {menu && menu.categories.length === 0 && (
        <div className="p-8 text-center text-muted text-sm">В этом ресторане пока нет меню</div>
      )}

      <ProductSheet
        product={productOpen}
        restaurantId={restaurantId}
        isOpen={!!productOpen}
        onClose={() => setProductOpen(null)}
      />

      <RestaurantStatusModal
        isOpen={!!closed}
        onClose={() => {
          /* noop */
        }}
        message={restaurant?.pauseMessage}
      />

      <AnimatePresence>
        {searchOpen && menu && (
          <FullscreenSearch
            scope="menu"
            menuCategories={menu.categories}
            onCategorySelect={(id) => onSelectCat(id)}
            onProductSelect={(p) => setProductOpen(p)}
            onClose={() => setSearchOpen(false)}
          />
        )}
      </AnimatePresence>

      <FloatingCart />
    </div>
  );
}
