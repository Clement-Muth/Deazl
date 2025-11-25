"client only";

import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import { type CSSProperties, type FC, type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;

  // Customisation visuelle
  maxHeight?: string;
  showHandle?: boolean;
  handleClassName?: string;
  sheetClassName?: string;
  contentClassName?: string;
  overlayClassName?: string;

  // Comportement
  closeOnOverlayClick?: boolean;
  closeThreshold?: number;
  snapPoints?: number[];

  // Animation
  animationDuration?: number;
  animationType?: "spring" | "tween";
  springConfig?: { damping: number; stiffness: number };

  // Callbacks
  onOpen?: () => void;
  onCloseStart?: () => void;
  onCloseComplete?: () => void;

  // Styles inline
  sheetStyle?: CSSProperties;
  contentStyle?: CSSProperties;
}

const BottomSheetComponent: FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  maxHeight = "70vh",
  showHandle = true,
  handleClassName = "w-12 h-1.5 my-3 mx-auto rounded-full bg-gray-300",
  sheetClassName = "absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl dark:bg-background",
  contentClassName = "p-4 overflow-y-auto overscroll-contain bg-background",
  overlayClassName = "absolute inset-0 bg-black/40 backdrop-blur-sm",
  closeOnOverlayClick = true,
  closeThreshold = 0.3,
  snapPoints,
  animationDuration = 0.3,
  animationType = "tween",
  springConfig = { damping: 25, stiffness: 300 },
  onOpen,
  onCloseStart,
  onCloseComplete,
  sheetStyle,
  contentStyle
}) => {
  const y = useMotionValue(0);
  const overlayOpacity = useTransform(y, [0, 300], [1, 0]);

  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const startY = useRef<number | null>(null);
  const lastY = useRef(0);
  const isSwiping = useRef(false);
  const isOnContent = useRef(false);
  const isClosing = useRef(false);
  const velocityY = useRef(0);
  const lastTouchTime = useRef(0);
  const lastTouchY = useRef(0);
  const initialScrollTop = useRef(0);

  useEffect(() => {
    if (isOpen) {
      isSwiping.current = false;
      startY.current = null;
      lastY.current = 0;
      isClosing.current = false;
      velocityY.current = 0;
      initialScrollTop.current = 0;
      y.set(0);
      onOpen?.();
    }
  }, [isOpen, y, onOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  const handleStart = (e: React.TouchEvent) => {
    if (isClosing.current) return;

    const target = e.target as HTMLElement;
    isOnContent.current = contentRef.current?.contains(target) ?? false;
    startY.current = e.touches[0].clientY;
    lastY.current = y.get();
    lastTouchY.current = e.touches[0].clientY;
    lastTouchTime.current = Date.now();
    isSwiping.current = false;
    velocityY.current = 0;

    // Enregistrer la position de scroll initiale
    if (contentRef.current) {
      initialScrollTop.current = contentRef.current.scrollTop;
    }
  };

  const handleMove = (e: React.TouchEvent) => {
    if (startY.current === null || isClosing.current) return;

    const current = e.touches[0].clientY;
    const delta = current - startY.current;

    // Calculer la vélocité
    const now = Date.now();
    const timeDelta = now - lastTouchTime.current;
    if (timeDelta > 0) {
      velocityY.current = (current - lastTouchY.current) / timeDelta;
    }
    lastTouchY.current = current;
    lastTouchTime.current = now;

    if (isOnContent.current) {
      if (!contentRef.current) return;

      const currentScrollTop = contentRef.current.scrollTop;
      const atTop = currentScrollTop <= 0;
      const scrollable = contentRef.current.scrollHeight > contentRef.current.clientHeight;

      // Si on n'a pas encore activé le swipe
      if (!isSwiping.current) {
        // Condition 1: Le contenu n'est pas scrollable ET on tire vers le bas
        const canSwipeNonScrollable = !scrollable && delta > 10;

        // Condition 2: On est en haut ET on a commencé en haut ET on tire vers le bas
        const canSwipeFromTop = atTop && initialScrollTop.current <= 0 && delta > 10;

        if (canSwipeNonScrollable || canSwipeFromTop) {
          isSwiping.current = true;
          if (contentRef.current) {
            contentRef.current.style.overflow = "hidden";
            contentRef.current.style.touchAction = "none";
          }
        }
      }

      // Si le contenu est scrollable et qu'on n'est PAS en swipe mode
      if (scrollable && !isSwiping.current) {
        // Laisser le scroll natif fonctionner
        return;
      }
    } else {
      // Swipe depuis la poignée ou en dehors du contenu
      if (!isSwiping.current && delta > 10) {
        isSwiping.current = true;
      }
    }

    if (isSwiping.current) {
      e.preventDefault();
      e.stopPropagation();
      y.set(Math.max(0, lastY.current + delta));
    }
  };

  const findNearestSnapPoint = (currentY: number) => {
    if (!snapPoints || snapPoints.length === 0) return null;

    return snapPoints.reduce((nearest, point) => {
      return Math.abs(point - currentY) < Math.abs(nearest - currentY) ? point : nearest;
    });
  };

  const animateToClose = () => {
    if (!sheetRef.current || isClosing.current) return;

    isClosing.current = true;
    onCloseStart?.();

    const sheetHeight = sheetRef.current.offsetHeight;

    animate(y, sheetHeight, {
      type: animationType,
      duration: animationDuration,
      ease: "easeInOut",
      onComplete: () => {
        onClose();
        isClosing.current = false;
      }
    });
  };

  const animateToPosition = (targetY: number) => {
    animate(y, targetY, {
      type: animationType === "spring" ? "spring" : "tween",
      ...(animationType === "spring" ? springConfig : { duration: animationDuration * 0.5, ease: "easeOut" })
    });
  };

  const handleEnd = () => {
    if (!sheetRef.current || isClosing.current) return;

    const sheetHeight = sheetRef.current.offsetHeight;
    const currentY = y.get();

    // Vérifier les snap points
    const snapPoint = findNearestSnapPoint(currentY);
    if (snapPoint !== null && Math.abs(currentY - snapPoint) < 50) {
      animateToPosition(snapPoint);
    } else {
      const threshold = sheetHeight * closeThreshold;

      // Fermer seulement si dépassé le seuil
      if (currentY > threshold) {
        animateToClose();
      } else {
        animateToPosition(0);
      }
    }

    if (contentRef.current) {
      contentRef.current.style.overflow = "auto";
      contentRef.current.style.touchAction = "pan-y";
    }
    isSwiping.current = false;
    startY.current = null;
    lastY.current = 0;
    velocityY.current = 0;
    initialScrollTop.current = 0;
  };

  const handleOverlayClick = () => {
    if (closeOnOverlayClick && !isClosing.current) {
      animateToClose();
    }
  };

  const transitionConfig: any =
    animationType === "spring"
      ? { type: "spring" as const, ...springConfig }
      : { type: "tween" as const, duration: animationDuration, ease: "easeOut" as const };

  return createPortal(
    <AnimatePresence mode="wait" onExitComplete={onCloseComplete}>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50"
          style={{ touchAction: "none" }}
          onTouchMove={(e) => {
            if (isSwiping.current) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <motion.div
            className={overlayClassName}
            style={{ opacity: overlayOpacity }}
            onClick={handleOverlayClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animationDuration }}
          />

          <motion.div
            ref={sheetRef}
            className={sheetClassName}
            style={{
              y,
              touchAction: "none",
              ...sheetStyle
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={transitionConfig}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            onTouchCancel={handleEnd}
          >
            {showHandle && <div className={handleClassName} />}

            <div
              ref={contentRef}
              className={contentClassName}
              style={{
                maxHeight,
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-y",
                ...contentStyle
              }}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export const BottomSheet = dynamic(() => Promise.resolve(BottomSheetComponent), { ssr: false });
