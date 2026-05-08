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
    return onCartFly(({ fromRect }) => {
      if (!fromRect) return;
      const to = getCartTargetCenter();
      if (!to) return;
      const from = rectCenter(fromRect);
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      setFlights((prev) => [...prev, { id, from, to }]);
      window.setTimeout(() => {
        setFlights((prev) => prev.filter((f) => f.id !== id));
      }, 800);
    });
  }, []);

  return (
    <AnimatePresence>
      {flights.map((f) => (
        <motion.div
          key={f.id}
          className="fixed left-0 top-0 z-[9999] pointer-events-none"
          initial={{
            x: f.from.x,
            y: f.from.y,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: [f.from.x, (f.from.x + f.to.x) / 2, f.to.x],
            y: [f.from.y, Math.min(f.from.y, f.to.y) - 120, f.to.y],
            scale: [1, 1.1, 0.35],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
        >
          <div className="w-3.5 h-3.5 rounded-full bg-primary shadow-lg shadow-primary/30 ring-2 ring-white/70" />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
