"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTableStore } from "@/stores/tableStore";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { getTableByNumber, PublicRestaurant } from "@/lib/api";
import { RestaurantList } from "@/components/order";
import { Header } from "@/components/layout/Header";

import { BottomNav } from "@/components/layout/BottomNav";
import { Icon } from "@/components/ui/Icon";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setTable = useTableStore((state) => state.setTable);
  const { setMode, setRestaurant } = useOrderModeStore();

  const [isQrMode, setIsQrMode] = useState<boolean | null>(null);

  // REMOVED: Aggressive session clearing logic
  // State should ONLY be cleared when:
  // 1. Session is explicitly closed by admin (checked via API when placing new order)
  // 2. 3-hour timeout (handled by CacheManager)
  // 3. User successfully pays (handled in checkout flow)
  // Navigation between pages should NEVER clear cart/table state

  useEffect(() => {
    const tableParam = searchParams.get("table");
    const menuParam = searchParams.get("menu");

    if (tableParam) {
      // QR code scan - set QR mode and redirect to menu
      setIsQrMode(true);
      setMode("qr");
      const tableNumber = parseInt(tableParam, 10);
      if (!isNaN(tableNumber)) {
        getTableByNumber(tableNumber)
          .then((table) => {
            setTable({
              id: table.id,
              number: table.number,
              restaurantId: table.restaurantId,
              restaurantName: table.restaurantName,
              menuId: menuParam || table.menuId,
              menuName: menuParam ? undefined : table.menuName,
              restaurantPhone: table.restaurantPhone,
              onlinePaymentAvailable: table.onlinePaymentAvailable,
            });
            router.replace("/menu");
          })
          .catch(() => {
            setTable({
              id: `table-${tableNumber}`,
              number: tableNumber,
              menuId: menuParam || undefined,
            });
            router.replace("/menu");
          });
        return;
      }
    }

    // No table param - show mode selection
    setIsQrMode(false);

    // State is preserved during navigation
    // Clearing only happens via:
    // 1. CacheManager (3-hour timeout)
    // 2. Successful payment flow
    // 3. Backend returns SESSION_CLOSED error
  }, [searchParams, router, setTable, setMode]);


  const handleSelectRestaurant = (restaurant: PublicRestaurant) => {
    setRestaurant(restaurant.id, restaurant.name, restaurant.deliveryFee);
    // Navigate to menu with restaurant context
    router.push(`/menu?restaurant=${restaurant.id}`);
  };

  // Loading state while checking for QR
  if (isQrMode === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-light to-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg shadow-primary-200 overflow-hidden">
            <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <p className="text-gray-500 font-medium">Загрузка...</p>
        </div>
      </div>
    );
  }

  // QR mode loading
  if (isQrMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-light to-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg shadow-primary-200 overflow-hidden">
            <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <p className="text-gray-500 font-medium">Загрузка меню...</p>
        </div>
      </div>
    );
  }

  // QR-only mode: show "Scan QR" message
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
        <div className="text-center py-12">
          <div className="relative inline-block">
            <div className="w-28 h-28 rounded-3xl bg-white flex items-center justify-center shadow-xl shadow-primary-200/50 overflow-hidden">
              <img src="/assets/logo.jpg" alt="Oson eats" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mt-8 mb-3">
            Добро пожаловать!
          </h1>
          <p className="text-gray-500 text-lg">
            Oson eats
          </p>
        </div>

        {/* QR scan card - main focus */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mb-6">
              <Icon name="qr_code_scanner" size={40} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Отсканируйте QR-код
            </h2>
            <p className="text-gray-500">
              Найдите QR-код на вашем столе и отсканируйте его камерой телефона для просмотра меню и оформления заказа
            </p>
          </div>
        </div>

        {/* Help info */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Icon name="help" size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-blue-800 mb-1">Как это работает?</p>
              <p className="text-sm text-blue-600">
                1. Откройте камеру телефона<br />
                2. Наведите на QR-код на столе<br />
                3. Перейдите по ссылке
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-light to-white">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg shadow-primary-200 overflow-hidden">
              <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <p className="text-gray-500 font-medium">Загрузка...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
