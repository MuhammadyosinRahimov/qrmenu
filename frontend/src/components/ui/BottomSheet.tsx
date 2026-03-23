"use client";

import { ReactNode, useRef } from "react";
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform, animate } from "framer-motion";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  maxHeight = "90vh",
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 300], [1, 0]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Close if dragged down more than 150px or with velocity > 500
    if (info.offset.y > 150 || info.velocity.y > 500) {
      onClose();
    } else {
      // Snap back to position
      animate(y, 0, { type: "spring", damping: 30, stiffness: 300 });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
            style={{ opacity }}
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 overflow-hidden"
            style={{ maxHeight, y }}
          >
            {/* Drag handle - only this area is draggable */}
            <motion.div
              className="sticky top-0 bg-white pt-3 pb-2 cursor-grab active:cursor-grabbing z-10"
              drag="y"
              dragConstraints={{ top: 0, bottom: 300 }}
              dragElastic={0.2}
              onDrag={(_, info) => y.set(Math.max(0, info.offset.y))}
              onDragEnd={handleDragEnd}
              style={{ touchAction: "none" }}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />
            </motion.div>

            {/* Content - normal scrolling works here */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight: `calc(${maxHeight} - 24px)` }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
