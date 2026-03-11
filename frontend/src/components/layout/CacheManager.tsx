"use client";

import { useEffect } from "react";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { useCartStore } from "@/stores/cartStore";
import { useTableStore } from "@/stores/tableStore";

const CACHE_EXPIRY_MS = 3 * 60 * 60 * 1000; // 3 hours

export function CacheManager() {
  const { mode, clearMode } = useOrderModeStore();
  const { clearCart } = useCartStore();
  const { clearTable } = useTableStore();

  useEffect(() => {
    // ONE-TIME WIPE FOR LEGACY USERS
    // This clears all caches for users who have the old, infinite-duration cache
    const hasBeenClearedV3 = localStorage.getItem("yalla_cache_cleared_v3");
    
    if (!hasBeenClearedV3) {
      console.log("CacheManager: Performing one-time wipe of legacy caches (v3).");
      clearMode();
      clearCart();
      clearTable();
      
      // Explicitly delete legacy keys, AND auth tokens per user request
      localStorage.removeItem("order-mode-storage");
      localStorage.removeItem("cart-storage");
      localStorage.removeItem("table-storage");
      localStorage.removeItem("current-mode"); 
      localStorage.removeItem("auth-storage");
      localStorage.removeItem("token");
      sessionStorage.clear();
      
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
      
      // If time since last activity is greater than expiry, clear EVERYTHING
      if (timeSinceLastActivity > CACHE_EXPIRY_MS) {
        console.log("CacheManager: Cache expired. Clearing all session data.");
        
        // Clear stores
        clearMode();
        clearCart();
        clearTable();

        // Hard clear the specific localStorage keys just to be absolutely certain
        localStorage.removeItem("order-mode-storage");
        localStorage.removeItem("cart-storage");
        localStorage.removeItem("table-storage");
        
        // Clear sessionStorage as well
        sessionStorage.clear();
      }
    }

    // Update the last activity timestamp
    localStorage.setItem("yalla_last_activity", now.toString());

    // Setup an interval to ping activity while the tab is open
    const activityInterval = setInterval(() => {
      localStorage.setItem("yalla_last_activity", Date.now().toString());
    }, 60000); // Update every minute while active

    // Listen for tab close / app exit
    const handleExit = () => {
      // User explicitly requested to delete authentication and EVERYTHING on window close
      localStorage.clear();
      sessionStorage.clear();
    };

    window.addEventListener("beforeunload", handleExit);
    window.addEventListener("pagehide", handleExit);

    return () => {
      clearInterval(activityInterval);
      window.removeEventListener("beforeunload", handleExit);
      window.removeEventListener("pagehide", handleExit);
    };
  }, [clearMode, clearCart, clearTable]);

  return null; // This is a logic-only component
}
