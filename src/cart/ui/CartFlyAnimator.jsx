import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { onCartFly } from "../lib/cartEvents";

function getCartTargetCenter() {
  const el = document.getElementById("cart-icon");
  const r = el?.getBoundingClientRect?.();
  if (!r) return null;
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function rectCenter(rect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export default function CartFlyAnimator() {
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    return onCartFly((detail) => {
      if (!detail?.fromRect) return;
      const to = getCartTargetCenter();
      if (!to) return;
      
      const fromRect = {
        left: detail.fromRect.left,
        top: detail.fromRect.top,
        width: detail.fromRect.width,
        height: detail.fromRect.height,
      };
      
      const from = rectCenter(fromRect);
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      setFlights((prev) => [...prev, { 
        id, 
        from, 
        to, 
        thumbnail: detail.thumbnailUrl,
        title: detail.title
      }]);
      
      // Remove after animation completes
      window.setTimeout(() => {
        setFlights((prev) => prev.filter((f) => f.id !== id));
      }, 1500);
    });
  }, []);

  return (
    <AnimatePresence>
      {flights.map((f) => (
        <motion.div
          key={f.id}
          className="fixed left-0 top-0 z-[9999] pointer-events-none"
          initial={{
            x: f.from.x - 12,
            y: f.from.y - 12,
            scale: 0.6,
            opacity: 1,
            rotate: 0,
          }}
          animate={{
            x: [f.from.x - 12, f.from.x + 20, (f.from.x + f.to.x) / 2 + 10, f.to.x - 8],
            y: [f.from.y - 12, f.from.y - 40, Math.min(f.from.y, f.to.y) - 120, f.to.y - 8],
            scale: [0.6, 0.9, 0.8, 0.2],
            opacity: [1, 1, 0.8, 0],
            rotate: [0, -15, 20, 0],
          }}
          transition={{
            duration: 1.2,
            ease: [0.42, 0, 0.58, 1],
            times: [0, 0.3, 0.6, 1],
          }}
        >
          {/* Main flying item */}
          <div className="relative">
            {f.thumbnail ? (
              <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg ring-2 ring-white/80 shadow-primary/40 bg-white">
                <img
                  src={f.thumbnail}
                  alt={f.title || "Product"}
                  className="w-full h-full object-cover"
                  style={{ pointerEvents: "none" }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-lg ring-2 ring-white/80 shadow-primary/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 21v-4" />
                </svg>
              </div>
            )}
            
            {/* Glow effect behind */}
            <motion.div
              className="absolute inset-0 rounded-lg bg-primary/30 blur-md"
              initial={{ opacity: 0.5, scale: 0.8 }}
              animate={{ opacity: 0, scale: 2.5 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            />
            
            {/* Sparkle particles */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-yellow-300"
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 0,
                  scale: 0 
                }}
                animate={{ 
                  x: [0, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 70],
                  y: [0, (Math.random() - 0.5) * 30 - 20, (Math.random() - 0.5) * 50 - 40],
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0]
                }}
                transition={{ 
                  duration: 0.7, 
                  delay: i * 0.08,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}