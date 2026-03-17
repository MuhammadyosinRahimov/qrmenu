"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { useOrderStore } from "@/stores/orderStore";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { useTableStore } from "@/stores/tableStore";

interface NavItem {
  href: string;
  icon: string;
  filledIcon?: string;
  label: string;
  badge?: () => number;
  qrOnly?: boolean; // показывать только в QR-режиме
  hideInQr?: boolean; // скрывать в QR-режиме
}

export function BottomNav() {
  const pathname = usePathname();
  const pendingCount = useOrderStore((state) => state.pendingCount);
  const mode = useOrderModeStore((state) => state.mode);
  const { tableNumber, menuId } = useTableStore();

  // Check if user is on menu page
  const isOnMenuPage = pathname === "/menu" || pathname.startsWith("/menu");

  // Build QR-aware URLs
  const menuUrl = useMemo(() => {
    if (mode === "qr" && tableNumber) {
      return `/menu?table=${tableNumber}${menuId ? `&menu=${menuId}` : ''}`;
    }
    return "/menu";
  }, [mode, tableNumber, menuId]);

  const ordersUrl = useMemo(() => {
    if (mode === "qr" && tableNumber) {
      return `/orders?table=${tableNumber}${menuId ? `&menu=${menuId}` : ''}`;
    }
    return "/orders";
  }, [mode, tableNumber, menuId]);

  const navItems: NavItem[] = [
    // {
    //   href: isOnMenuPage ? "/" : "/",
    //   icon: "home",
    //   filledIcon: "home",
    //   label: "Главная",
    //   hideInQr: true
    // },
    {
      href: menuUrl,
      icon: "home",
      filledIcon: "home",
      label: "Меню",
    },
    {
      href: ordersUrl,
      icon: "receipt_long",
      filledIcon: "receipt_long",
      label: "Заказы",
      badge: () => pendingCount,
    },
  ];

  const isActive = (href: string) => {
    // Extract base path without query params
    const basePath = href.split('?')[0];
    if (basePath === "/menu") {
      // "Меню" активна на странице меню
      return pathname === "/menu" || pathname.startsWith("/menu");
    }
    if (basePath === "/orders") {
      return pathname === "/orders" || pathname.startsWith("/orders");
    }
    return pathname.startsWith(basePath);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 safe-area-inset-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems
          .filter((item) => (!item.qrOnly || mode === "qr") && !(item.hideInQr && mode === "qr"))
          .map((item) => {
          const active = isActive(item.href);
          const badgeCount = item.badge?.() || 0;
          const isDisabled = item.href === "/" && mode === "qr";

          // Заблокированная кнопка "Главная" в QR-режиме
          if (isDisabled) {
            return (
              <div
                key={item.href}
                className="flex flex-col items-center justify-center flex-1 h-full relative opacity-40 cursor-not-allowed"
              >
                <div className="relative">
                  <div className="p-1.5 rounded-xl">
                    <Icon
                      name={item.icon}
                      size={24}
                      className="text-gray-400"
                    />
                  </div>
                </div>
                <span className="text-xs mt-0.5 font-medium text-gray-400">
                  {item.label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200 ${
                active
                  ? "text-primary"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {/* Active indicator line */}
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}

              <div className="relative">
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                  active ? "bg-primary-light" : ""
                }`}>
                  <Icon
                    name={item.icon}
                    size={24}
                    filled={active}
                    className={active ? "text-primary" : "text-gray-400"}
                  />
                </div>

                {/* Badge for orders */}
                {badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm shadow-primary-200">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </div>

              <span className={`text-xs mt-0.5 font-medium ${
                active ? "text-primary" : "text-gray-400"
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
