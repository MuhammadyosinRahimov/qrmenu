# Режимы заказа (Доставка/В ресторане/С собой)

## Текущее состояние

Переключатель режимов **временно отключен**. Все рестораны показываются без фильтрации по режиму.

## Как вернуть переключатель режимов

### 1. OrderModeBar.tsx

Файл: `src/components/layout/OrderModeBar.tsx`

Восстановить полный код компонента:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useOrderModeStore, OrderMode } from "@/stores/orderModeStore";
import { useTableStore } from "@/stores/tableStore";

const modes: { value: OrderMode; label: string }[] = [
  { value: "delivery", label: "Доставка" },
  { value: "dinein", label: "В ресторане" },
  { value: "takeaway", label: "С собой" },
];

export function OrderModeBar() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { mode, setMode } = useOrderModeStore();
  const tableNumber = useTableStore((state) => state.tableNumber);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Скрыть если QR режим или есть номер стола
  if (!isHydrated || mode === "qr" || tableNumber) {
    return null;
  }

  const activeIndex = modes.findIndex((m) => m.value === mode);

  return (
    <div className="sticky top-14 bg-white/95 backdrop-blur-sm border-b border-border z-30 safe-area-inset-top">
      <div className="flex justify-center py-1 px-4">
        <div className="relative flex border border-gray-200 rounded-md p-1 bg-gray-50/50">
          <div
            className="absolute top-1 bottom-1 bg-primary rounded-2xl transition-all duration-300 ease-out"
            style={{
              width: `calc(${100 / modes.length}% - 4px)`,
              left: `calc(${(activeIndex * 100) / modes.length}% + 2px)`,
            }}
          />
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`relative z-10 flex-1 px-4 py-1 text-sm font-medium rounded-2xl transition-all duration-300 ${
                mode === m.value
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 2. RestaurantList.tsx

Файл: `src/components/order/RestaurantList.tsx`

Добавить `mode` параметр:

```typescript
import { OrderMode } from "@/stores/orderModeStore";

interface RestaurantListProps {
  mode: OrderMode;  // Добавить
  onSelectRestaurant: (restaurant: PublicRestaurant) => void;
  searchQuery?: string;
}

export function RestaurantList({ mode, onSelectRestaurant, searchQuery = "" }: RestaurantListProps) {
  const apiMode = mode === "delivery" ? "delivery" : mode === "takeaway" ? "takeaway" : undefined;

  const { data: restaurants = [], isLoading, error } = useQuery({
    queryKey: ["restaurants", apiMode],
    queryFn: () => getRestaurants(apiMode),
  });
  // ...
}
```

### 3. page.tsx (главная страница)

Файл: `src/app/page.tsx`

Добавить `mode` в RestaurantList:

```typescript
<RestaurantList
  mode={mode}  // Добавить
  onSelectRestaurant={handleSelectRestaurant}
  searchQuery={searchQuery}
/>
```

## Примечания

- QR-режим работает независимо от этих изменений
- При сканировании QR-кода переключатель автоматически скрывается
- Store `orderModeStore` остается без изменений
