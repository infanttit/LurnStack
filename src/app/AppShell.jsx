import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import SiteFooter from "../components/layout/SiteFooter";
import SiteNavbar from "../components/layout/SiteNavbar";
import { CartFlyAnimator } from "../cart";
import { AiChatWidget } from "../ai-chat";
import { ZohoSalesIQ } from "../integrations/zoho/salesiq";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function DraggableWhatsApp() {
  const [topPercent, setTopPercent] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startTopRef = useRef(0);
  const hasMovedRef = useRef(false);

  const handleStart = (clientY) => {
    setIsDragging(true);
    startYRef.current = clientY;
    const currentTopPx = (window.innerHeight * topPercent) / 100;
    startTopRef.current = currentTopPx;
    hasMovedRef.current = false;
  };

  const handleMove = (clientY) => {
    if (!isDragging) return;
    const deltaY = clientY - startYRef.current;
    if (Math.abs(deltaY) > 5) {
      hasMovedRef.current = true;
    }
    const newTopPx = startTopRef.current + deltaY;
    const minTop = 20;
    const maxTop = window.innerHeight - 60;
    const clampedTopPx = Math.max(minTop, Math.min(maxTop, newTopPx));
    const newPercent = (clampedTopPx / window.innerHeight) * 100;
    setTopPercent(newPercent);
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      handleMove(e.clientY);
    };
    const onMouseUp = () => {
      setIsDragging(false);
    };

    const onTouchMove = (e) => {
      if (isDragging) {
        if (e.cancelable) e.preventDefault();
        if (e.touches.length > 0) {
          handleMove(e.touches[0].clientY);
        }
      }
    };
    const onTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", onTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging]);

  const handleClick = (e) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <a
      href="https://wa.me/919677794485?text=Hi%20LurnStack%20Support%2C%20I'd%20like%20to%20inquire%20about%20your%20courses%20and%20upcoming%20live%20classes."
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onMouseDown={(e) => {
        if (e.button === 0) {
          handleStart(e.clientY);
        }
      }}
      onTouchStart={(e) => {
        if (e.touches.length > 0) {
          handleStart(e.touches[0].clientY);
        }
      }}
      style={{
        top: `${topPercent}%`,
        transform: "translateY(-50%)",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none"
      }}
      className="fixed right-0 z-[9999] flex h-10 w-10 items-center justify-center bg-[#075E54] text-white shadow-lg transition-all duration-300 hover:bg-[#128C7E] active:scale-95 group rounded-none"
      aria-label="Chat on WhatsApp"
    >
      <svg
        className="w-[22px] h-[22px] text-white fill-current transition-transform group-hover:scale-110 pointer-events-none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}

export default function AppShell() {
  return (
    <div className="min-h-dvh bg-background text-on-background">
      <ScrollToTop />
      <ZohoSalesIQ />
      <CartFlyAnimator />
      <AiChatWidget />
      <DraggableWhatsApp />

      <SiteNavbar />
      <main className="pt-[89px]">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
