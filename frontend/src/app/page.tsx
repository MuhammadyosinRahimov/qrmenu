"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTableStore } from "@/stores/tableStore";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { getTableByNumber, getMySessionInfo, PublicRestaurant } from "@/lib/api";
import { RestaurantList } from "@/components/order";
import { Header } from "@/components/layout/Header";

import { BottomNav } from "@/components/layout/BottomNav";
import { Icon } from "@/components/ui/Icon";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tableId, clearTable } = useTableStore();
  const setTable = useTableStore((state) => state.setTable);
  const { mode, setMode, setRestaurant, clearMode } = useOrderModeStore();
  const { clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [isQrMode, setIsQrMode] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Check if session is completed and clear context
  useEffect(() => {
    const checkAndClearSession = async () => {
      const tableParam = searchParams.get("table");

      // Only check if no QR param and we have stored table context
      if (!tableParam && tableId && isAuthenticated) {
        try {
          const sessionInfo = await getMySessionInfo(tableId);

          // If no session or all orders are paid, clear the context
          if (!sessionInfo || sessionInfo.myOrderIsPaid) {
            clearTable();
            clearCart();
            clearMode();
          }
        } catch {
          // If error (e.g., session not found), clear context
          clearTable();
          clearCart();
          clearMode();
        }
      }
    };

    checkAndClearSession();
  }, [tableId, isAuthenticated, searchParams, clearTable, clearCart, clearMode]);

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

    // Clear QR mode if user came directly without ?table= param
    // This allows users to exit QR mode by visiting the site directly
    if (mode === "qr") {
      clearMode();
      clearTable();
      clearCart();
    }
  }, [searchParams, router, setTable, setMode, mode, clearMode, clearTable, clearCart]);


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
