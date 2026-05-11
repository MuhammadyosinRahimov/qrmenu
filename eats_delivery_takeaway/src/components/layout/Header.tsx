"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { useOrderModeStore } from "@/stores/orderModeStore";
import { ProfilePopover } from "@/components/layout/ProfilePopover";
import { AddressEntryModal } from "@/components/delivery/AddressEntryModal";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  right?: React.ReactNode;
  /** When true, hide the address row even on the root page */
  hideAddress?: boolean;
}

export function Header({ title, showBack, right, hideAddress }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isRoot = pathname === "/";

  const deliveryAddress = useOrderModeStore((s) => s.deliveryAddress);

  const profileBtnRef = useRef<HTMLButtonElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  const showAddressLine = !hideAddress && !title;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between gap-3 px-4 h-16 max-w-lg mx-auto">
          <div className="flex items-center gap-2.5 min-w-0">
            {(showBack ?? !isRoot) && (
              <button
                onClick={() => router.back()}
                className="p-1 rounded-full hover:bg-gray-100 transition shrink-0"
                aria-label="Назад"
              >
                <Icon name="back" size={22} />
              </button>
            )}
            {title ? (
              <h1 className="text-base font-semibold truncate">{title}</h1>
            ) : (
              <Link href="/" className="flex items-center gap-2 min-w-0">
                <Image
                  src="/assets/logo.png"
                  alt="Yalla Eats"
                  width={36}
                  height={36}
                  className="rounded shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-foreground leading-tight truncate">
                    Yalla Eats
                  </span>
                  {showAddressLine && (
                    <button
                      type="button"
                      onClick={() => setAddressModalOpen(true)}
                      className="flex items-center gap-1 text-xs text-foreground/80 max-w-[180px] truncate"
                    >
                      <Icon
                        name="location"
                        size={14}
                        className="text-error shrink-0"
                      />
                      <span className="truncate">
                        {deliveryAddress || "Выберите адрес"}
                      </span>
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-foreground text-white shrink-0">
                        <Icon
                          name="chevron-right"
                          size={10}
                          className="leading-none"
                        />
                      </span>
                    </button>
                  )}
                </div>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 relative">
            {right}
            <button
              ref={profileBtnRef}
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              aria-label="Профиль"
              aria-expanded={profileOpen}
              className="w-10 h-10 rounded-full border border-border bg-white hover:bg-gray-50 flex items-center justify-center transition shrink-0"
            >
              <Icon name="profile" size={20} />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <ProfilePopover
                  anchorRef={profileBtnRef}
                  onClose={() => setProfileOpen(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <AddressEntryModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
      />
    </>
  );
}
