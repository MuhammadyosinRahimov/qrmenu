"use client";

import { ReactNode, useRef, useState, useCallback, useEffect } from "react";
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
  const contentRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 300], [1, 0]);

  // Track if we're at the top of scroll
  const [isAtTop, setIsAtTop] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);

  // Check scroll position
  const handleScroll = useCallback(() => {
    if (contentRef.current) {
      setIsAtTop(contentRef.current.scrollTop <= 0);
    }
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    startScrollTop.current = contentRef.current?.scrollTop || 0;
  }, []);

  // Handle touch move - decide whether to drag or scroll
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!contentRef.current) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;
    const scrollTop = contentRef.current.scrollTop;

    // If at top and pulling down, start dragging
    if (scrollTop <= 0 && deltaY > 0 && !isDragging) {
      setIsDragging(true);
    }

    // If dragging, update y position
    if (isDragging) {
      e.preventDefault();
      y.set(Math.max(0, deltaY));
    }
  }, [isDragging, y]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentY = e.changedTouches[0].clientY;
    const deltaY = currentY - startY.current;

    // Calculate velocity (simplified)
    const velocity = deltaY / 0.3; // Approximate velocity

    // Close if dragged more than 150px or with velocity > 500
    if (deltaY > 150 || velocity > 500) {
      onClose();
    } else {
      // Snap back to position with spring physics
      animate(y, 0, { type: "spring", damping: 25, stiffness: 400 });
    }

    setIsDragging(false);
  }, [isDragging, y, onClose]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Close if dragged down more than 150px or with velocity > 500
    if (info.offset.y > 150 || info.velocity.y > 500) {
      onClose();
    } else {
      // Snap back to position with spring physics
      animate(y, 0, { type: "spring", damping: 25, stiffness: 400 });
    }
  };

  // Reset state when sheet closes
  useEffect(() => {
    if (!isOpen) {
      y.set(0);
      setIsAtTop(true);
      setIsDragging(false);
    }
  }, [isOpen, y]);

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
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 overflow-hidden flex flex-col"
            style={{ maxHeight, y }}
          >
            {/* Drag handle - draggable area */}
            <motion.div
              className="sticky top-0 bg-white pt-3 pb-2 cursor-grab active:cursor-grabbing z-10 flex-shrink-0"
              drag="y"
              dragConstraints={{ top: 0, bottom: 300 }}
              dragElastic={0.2}
              onDrag={(_, info) => y.set(Math.max(0, info.offset.y))}
              onDragEnd={handleDragEnd}
              style={{ touchAction: "none" }}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />
            </motion.div>

            {/* Content - scrollable with touch detection */}
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{
                maxHeight: `calc(${maxHeight} - 28px)`,
                touchAction: isDragging ? "none" : "pan-y"
              }}
              onScroll={handleScroll}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
