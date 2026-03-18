"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";

const CACHE_EXPIRY_MS = 3 * 60 * 60 * 1000; // 3 hours

export function CacheManager() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    // ONE-TIME WIPE FOR LEGACY USERS
    // This clears all caches for users who have the old, infinite-duration cache
    const hasBeenClearedV3 = localStorage.getItem("yalla_cache_cleared_v3");
    
    if (!hasBeenClearedV3) {
      console.log("CacheManager: Performing one-time wipe of legacy caches (v3).");
      // НЕ вызываем clearTable() - сохраняем контекст стола!
      // clearTable() записывает null в sessionStorage, что теряет данные стола
      clearCart();

      // Explicitly delete legacy keys (but NOT auth - keep phone/token)
      localStorage.removeItem("order-mode-storage");
      localStorage.removeItem("cart-storage");
      localStorage.removeItem("table-storage");
      localStorage.removeItem("current-mode");
      // НЕ удаляем auth-storage и token - сохраняем авторизацию
      // НЕ удаляем table-storage-v2 - сохраняем контекст стола
      // НЕ удаляем order-mode-storage-v2 - сохраняем режим QR
      // Селективная очистка sessionStorage - сохраняем важные ключи
      const sessionKeysToKeep = ['table-storage-v2', 'order-mode-storage-v2'];
      Object.keys(sessionStorage).forEach(key => {
        if (!sessionKeysToKeep.some(keepKey => key.includes(keepKey))) {
          sessionStorage.removeItem(key);
        }
      });
      
      // Mark as cleared so we never do this hard wipe again
      localStorage.setItem("yalla_cache_cleared_v3", "true");
      
      // Also set the last activity so the regular 3-hour timer starts from now
      localStorage.setItem("yalla_last_activity", Date.now().toString());
      return; // Exit early this run
    }

    // NORMAL 3-HOUR EXPIRY LOGIC (For future usage)
    const lastActivity = localStorage.getItem("yalla_last_activity");
    const now = Date.now();

    if (lastActivity) {
      const timeSinceLastActivity = now - parseInt(lastActivity, 10);
      
      // If time since last activity is greater than expiry, clear cart only
      // Table context and order mode should persist until user scans a new QR
      if (timeSinceLastActivity > CACHE_EXPIRY_MS) {
        console.log("CacheManager: Cache expired. Clearing cart data.");

        // Only clear cart - preserve table and mode context
        clearCart();

        // Hard clear only legacy localStorage keys
        localStorage.removeItem("order-mode-storage");
        localStorage.removeItem("cart-storage");
        localStorage.removeItem("table-storage");

        // Селективная очистка sessionStorage - сохраняем важные ключи
        const sessionKeysToKeep = ['table-storage-v2', 'order-mode-storage-v2'];
        Object.keys(sessionStorage).forEach(key => {
          if (!sessionKeysToKeep.some(keepKey => key.includes(keepKey))) {
            sessionStorage.removeItem(key);
          }
        });
      }
    }

    // Update the last activity timestamp
    localStorage.setItem("yalla_last_activity", now.toString());

    // Setup an interval to ping activity while the tab is open
    const activityInterval = setInterval(() => {
      localStorage.setItem("yalla_last_activity", Date.now().toString());
    }, 60000); // Update every minute while active

    // REMOVED: beforeunload/pagehide handlers that cleared state on tab close
    // State should persist until:
    // 1. 3-hour timeout (handled above)
    // 2. Session is closed by admin
    // 3. User has paid and session is complete
    // Navigation between pages should NOT clear state

    return () => {
      clearInterval(activityInterval);
    };
  }, [clearCart]);

  return null; // This is a logic-only component
}
