# Реактивация режимов доставки/самовывоза

## Что было сделано

Временно отключены режимы **доставки** и **самовывоза**. Оставлен только **QR-режим** (сканирование QR-кода на столе).

### Изменённые файлы:

| Файл | Что изменено |
|------|--------------|
| `src/app/page.tsx` | Убран список ресторанов, показывается "Отсканируйте QR-код" |
| `src/stores/orderModeStore.ts` | Режим по умолчанию изменён с `delivery` на `qr` |
| `src/components/layout/BottomNav.tsx` | Убран `qrOnly: true` у кнопки "Меню" |
| `src/app/checkout/page.tsx` | Убраны функции переключения режимов |
| `src/components/order/DeliveryForm.tsx` | Убрана кнопка переключения режимов |

---

## Как включить режимы обратно

### 1. Изменить режим по умолчанию

**Файл:** `src/stores/orderModeStore.ts`

```typescript
// Строка 38 - БЫЛО:
mode: "qr",

// ИЗМЕНИТЬ НА:
mode: "delivery",
```

```typescript
// Строка ~78 в функции clearMode - БЫЛО:
mode: "qr",

// ИЗМЕНИТЬ НА:
mode: "delivery",
```

---

### 2. Вернуть список ресторанов на главную

**Файл:** `src/app/page.tsx`

Заменить блок "QR-only mode" (примерно строки 140-224) на оригинальный код:

```tsx
// QR-only mode: show "Scan QR" message
return (
  <div className="min-h-screen bg-gradient-to-b from-primary-light via-white to-primary-light/30 pb-20">
    {/* ... текущий код с "Отсканируйте QR-код" ... */}
  </div>
);
```

**Заменить на:**

```tsx
// Mode selection UI with soft design
return (
  <div className="min-h-screen bg-gradient-to-b from-primary-light via-white to-primary-light/30 pb-20">
    {/* Decorative background elements */}
    <div className="absolute top-0 left-0 w-full h-64 overflow-hidden pointer-events-none">
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary-200/30 rounded-full blur-3xl" />
      <div className="absolute -top-16 right-0 w-48 h-48 bg-primary-100/30 rounded-full blur-3xl" />
    </div>

    <Header title="Oson eats" />

    <div className="relative p-4 space-y-8 max-w-md mx-auto">
      {/* Welcome Hero */}
      <div className="text-center py-6">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-3xl bg-white flex items-center justify-center shadow-xl shadow-primary-200/50 transform rotate-3 overflow-hidden">
            <img src="/assets/logo.jpg" alt="Oson eats" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg">
            <Icon name="check" size={18} className="text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mt-6 mb-2">
          Добро пожаловать!
        </h1>
        <p className="text-gray-500 text-lg">
          Выберите способ заказа
        </p>
      </div>

      {/* Search input */}
      {mode !== "qr" && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon name="search" size={22} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Найти ресторан..."
            className="w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <div className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
                <Icon name="close" size={14} className="text-gray-500" />
              </div>
            </button>
          )}
        </div>
      )}

      {/* Restaurant list - show for all users */}
      {mode !== "qr" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <RestaurantList
            onSelectRestaurant={handleSelectRestaurant}
            searchQuery={searchQuery}
          />
        </div>
      )}

      {/* QR hint card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Icon name="qr_code" size={24} className="text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">
              Есть QR-код на столе?
            </p>
            <p className="text-sm text-gray-500">
              Отсканируйте его для быстрого заказа
            </p>
          </div>
          <Icon name="arrow_forward" size={20} className="text-gray-400" />
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
);
```

---

### 3. Вернуть кнопку переключения режимов в DeliveryForm

**Файл:** `src/components/order/DeliveryForm.tsx`

**Шаг 1:** Добавить `mode` и `setMode` в деструктуризацию:

```typescript
const {
  mode,           // <- добавить
  setMode,        // <- добавить
  deliveryAddress,
  setDeliveryAddress,
  customerName,
  setCustomerName,
  deliveryFee,
  selectedRestaurantName,
} = useOrderModeStore();
```

**Шаг 2:** Добавить функции после `const [isLoadingLocation, setIsLoadingLocation] = useState(false);`:

```typescript
// Mode cycle: delivery -> dinein -> takeaway -> delivery
const cycleMode = () => {
  if (mode === "delivery") {
    setMode("dinein");
  } else if (mode === "dinein") {
    setMode("takeaway");
  } else if (mode === "takeaway") {
    setMode("delivery");
  }
};

const getModeIcon = () => {
  switch (mode) {
    case "delivery": return "delivery_dining";
    case "dinein": return "restaurant";
    case "takeaway": return "takeout_dining";
    default: return "delivery_dining";
  }
};

const getModeLabel = () => {
  switch (mode) {
    case "delivery": return "Доставка";
    case "dinein": return "В ресторане";
    case "takeaway": return "Самовывоз";
    default: return "Доставка";
  }
};
```

**Шаг 3:** Добавить кнопку переключения режимов перед `<div className="space-y-3">`:

```tsx
{/* Compact mode selector */}
<button
  onClick={cycleMode}
  className="w-full h-10 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-between px-4 hover:bg-gray-50 transition-colors"
>
  <div className="flex items-center gap-2">
    <Icon name={getModeIcon()} size={16} className="text-[#dda15e]" />
    <span className="text-sm font-medium text-gray-700">{getModeLabel()}</span>
  </div>
  <Icon name="chevron_right" size={18} className="text-gray-400" />
</button>
```

---

### 4. (Опционально) Вернуть qrOnly для кнопки "Меню"

**Файл:** `src/components/layout/BottomNav.tsx`

```typescript
// БЫЛО:
{
  href: "/menu",
  icon: "home",
  filledIcon: "home",
  label: "Меню",
},

// ИЗМЕНИТЬ НА:
{
  href: "/menu",
  icon: "home",
  filledIcon: "home",
  label: "Меню",
  qrOnly: true, // показывать только в QR-режиме
},
```

---

## Проверка после реактивации

1. Открыть главную страницу `/` - должен показываться список ресторанов
2. Выбрать ресторан - должно открываться меню
3. Оформить заказ - должна быть возможность переключаться между доставкой/самовывозом/в ресторане
4. QR-режим должен работать как и раньше при сканировании QR-кода

---

## Контакты

Если возникли вопросы по реактивации, обращайтесь к разработчику.
