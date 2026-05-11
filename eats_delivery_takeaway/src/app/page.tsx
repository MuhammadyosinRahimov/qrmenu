"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { ModeButtons } from "@/components/layout/ModeButtons";
import { RestaurantList, type RestaurantSort } from "@/components/restaurant/RestaurantList";
import { Icon } from "@/components/ui/Icon";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import { FullscreenSearch } from "@/components/search/FullscreenSearch";
import { AddressEntryModal } from "@/components/delivery/AddressEntryModal";
import { useGeolocationStore } from "@/stores/geolocationStore";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { getImageUrl, getRestaurantCategories } from "@/lib/api";

export default function HomePage() {
  const requestGeo = useGeolocationStore((s) => s.request);
  const mode = useOrderModeStore((s) => s.mode);
  const deliveryAddress = useOrderModeStore((s) => s.deliveryAddress);

  const [sort, setSort] = useState<RestaurantSort>("smart");
  const [searchOpen, setSearchOpen] = useState(false);
  const [openOnly, setOpenOnly] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["restaurant-categories"],
    queryFn: getRestaurantCategories,
  });

  // Geolocation prompt on first visit
  useEffect(() => {
    if (typeof window === "undefined") return;
    const asked = window.localStorage.getItem("geo_asked");
    if (asked) return;
    if (!("geolocation" in navigator)) return;
    window.localStorage.setItem("geo_asked", "1");
    requestGeo().catch(() => {});
  }, [requestGeo]);

  // Auto-open address modal: forced after login OR first visit when no address selected
  useEffect(() => {
    if (typeof window === "undefined") return;
    const forced = window.sessionStorage.getItem("openAddressOnHome");
    if (forced) {
      window.sessionStorage.removeItem("openAddressOnHome");
      setAddressOpen(true);
      return;
    }
    if (deliveryAddress) return;
    const seen = window.sessionStorage.getItem("addressModalSeen");
    if (seen) return;
    window.sessionStorage.setItem("addressModalSeen", "1");
    setAddressOpen(true);
  }, [deliveryAddress]);

  return (
    <div className="min-h-dvh pb-8">
      <Header />

      <main className="px-4 pt-3 space-y-3 max-w-lg mx-auto">
        <SearchTrigger
          placeholder="Поиск ресторанов и блюд"
          onClick={() => setSearchOpen(true)}
        />
        <ModeButtons />

        {categories && categories.length > 0 && (
          <div className="-mx-4">
            <h2 className="px-4 mb-2 text-base font-extrabold tracking-tight">Что заказать</h2>
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex items-start gap-1 px-4 pb-1">
                <button
                  onClick={() => setActiveCategoryId(null)}
                  className="flex flex-col items-center flex-shrink-0 w-20 group"
                >
                  <span
                    className={[
                      "relative w-16 h-16 rounded-full overflow-hidden flex items-center justify-center transition-all",
                      activeCategoryId === null
                        ? "bg-primary/10 ring-2 ring-primary"
                        : "bg-gray-100",
                    ].join(" ")}
                  >
                    <Icon
                      name="menu"
                      size={26}
                      className={activeCategoryId === null ? "text-primary" : "text-foreground/60"}
                    />
                  </span>
                  <span
                    className={[
                      "mt-1.5 text-[11px] text-center leading-tight transition-colors",
                      activeCategoryId === null ? "font-bold text-foreground" : "font-medium text-foreground/80",
                    ].join(" ")}
                  >
                    Все
                  </span>
                </button>
                {categories.map((c) => {
                  const active = activeCategoryId === c.id;
                  const img = c.iconUrl ? getImageUrl(c.iconUrl) : null;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveCategoryId(c.id)}
                      className="flex flex-col items-center flex-shrink-0 w-20 group"
                    >
                      <span
                        className={[
                          "relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 transition-all",
                          active ? "ring-2 ring-primary" : "",
                        ].join(" ")}
                      >
                        {img ? (
                          <Image
                            src={img}
                            alt={c.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-foreground/40">
                            <Icon name="restaurant" size={28} />
                          </span>
                        )}
                      </span>
                      <span
                        className={[
                          "mt-1.5 text-[11px] text-center leading-tight line-clamp-2 transition-colors",
                          active ? "font-bold text-foreground" : "font-medium text-foreground/80",
                        ].join(" ")}
                      >
                        {c.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          <SortChip
            active={sort === "smart"}
            onClick={() => setSort("smart")}
            icon="sparkles"
            label="Рекомендуем"
          />
          <SortChip
            active={sort === "distance"}
            onClick={() => setSort("distance")}
            icon="near_me"
            label="Ближайшие"
          />
          <SortChip
            active={sort === "rating"}
            onClick={() => setSort("rating")}
            icon="star"
            label="По рейтингу"
          />
          <SortChip
            active={sort === "time"}
            onClick={() => setSort("time")}
            icon="bolt"
            label="Быстрее"
          />
          {mode === "delivery" && (
            <SortChip
              active={sort === "fee"}
              onClick={() => setSort("fee")}
              icon="delivery_dining"
              label="По цене доставки"
            />
          )}
          <SortChip
            active={openOnly}
            onClick={() => setOpenOnly((v) => !v)}
            icon="clock"
            label="Открытые сейчас"
          />
        </div>
      </main>

      <RestaurantList
        query=""
        minRating={0}
        maxPrepTime={0}
        sort={sort}
        openOnly={openOnly}
        categoryId={activeCategoryId}
      />

      <AnimatePresence>
        {searchOpen && (
          <FullscreenSearch
            scope="restaurants"
            onClose={() => setSearchOpen(false)}
          />
        )}
      </AnimatePresence>

      <AddressEntryModal
        isOpen={addressOpen}
        onClose={() => setAddressOpen(false)}
      />
    </div>
  );
}

function SortChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition",
        active
          ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
          : "bg-white text-foreground border-border hover:bg-surface",
      ].join(" ")}
    >
      <Icon name={icon} size={14} />
      <span>{label}</span>
    </button>
  );
}
