import { useMemo, useState } from "react";
import { FiTrash2, FiShoppingCart, FiShield, FiTag } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "../model/CartContext";
import { formatINRFromPaise } from "../lib/cartUtils";

// Star rating display
function StarRating({ rating = 0, count = 0 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-1">
      <span className="text-xs font-bold text-amber-500">{rating.toFixed(1)}</span>
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className={`w-3 h-3 ${i < full ? "text-amber-400" : i === full && half ? "text-amber-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
            {i < full ? (
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            ) : (
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            )}
          </svg>
        ))}
      </span>
      <span className="text-xs text-on-surface-variant">({count.toLocaleString()} ratings)</span>
    </span>
  );
}

// Badge for tags like "Premium", "Updated Recently"
function Badge({ label, variant = "premium" }) {
  if (variant === "updated") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
      {label}
    </span>
  );
}

export default function CartPage() {
  const { items, itemCount, subtotalPaise, removeItem, addItem, clear } = useCart();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState("");
  const [savedItems, setSavedItems] = useState([]);
  const [removingIds, setRemovingIds] = useState(new Set());

  const discountPaise = useMemo(() => 0, []);
  const totalPaise = Math.max(0, subtotalPaise - discountPaise);

  // Animate out then remove
  const handleRemove = (id) => {
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      removeItem(id);
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  const handleSaveForLater = (item) => {
    setSavedItems((prev) => [...prev, item]);
    handleRemove(item.id);
  };

  const handleMoveToCart = (item) => {
    setSavedItems((prev) => prev.filter((s) => s.id !== item.id));
    addItem?.(item);
  };

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-10">
      {/* Page title */}
      <h1 className="font-h2 text-h2 text-on-surface mb-1">Shopping Cart</h1>

      <div className="mt-6 flex flex-col lg:flex-row gap-10 items-start">
        {/* ── LEFT: Item list ─────────────────────────────────────── */}
        <section className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface mb-4">
            {itemCount} {itemCount === 1 ? "Course" : "Courses"} in Cart
          </p>

          <div className="divide-y divide-outline-variant border-t border-outline-variant">
            {items.length === 0 && savedItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-16 text-center text-on-surface-variant"
              >
                <FiShoppingCart className="text-5xl mx-auto mb-3 opacity-40" />
                <p className="text-sm">Your cart is empty. Add a course to get started.</p>
              </motion.div>
            ) : (
              <AnimatePresence initial={false}>
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={
                      removingIds.has(item.id)
                        ? { opacity: 0, x: 40, height: 0, paddingTop: 0, paddingBottom: 0 }
                        : { opacity: 1, x: 0 }
                    }
                    transition={{ duration: 0.28, ease: "easeInOut", delay: removingIds.has(item.id) ? 0 : i * 0.06 }}
                    exit={{ opacity: 0, x: 40, height: 0, paddingTop: 0, paddingBottom: 0 }}
                    className="py-5 flex gap-4 group overflow-hidden"
                  >
                    {/* Thumbnail */}
                    <div className="w-28 h-20 flex-shrink-0 rounded overflow-hidden bg-surface-variant shadow-sm">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={[
                            "w-full h-full bg-gradient-to-br",
                            item.thumbnailBg || "from-slate-900 via-emerald-800 to-teal-500",
                          ].join(" ")}
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-on-surface leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-on-surface-variant">
                        By {item.instructor}
                      </p>

                      {/* Rating */}
                      <div className="mt-1.5">
                        <StarRating
                          rating={item.rating ?? 4.5}
                          count={item.ratingCount ?? 0}
                        />
                      </div>

                      {/* Meta: hours · lectures · level */}
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {[
                          item.totalHours && `${item.totalHours} total hours`,
                          item.lectures && `${item.lectures} lectures`,
                          item.level,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>

                      {/* Badges */}
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {item.updatedRecently && <Badge label="Updated Recently" variant="updated" />}
                        {item.isPremium !== false && <Badge label="Premium" />}
                      </div>

                      {/* Actions */}
                      <div className="mt-2 flex items-center gap-3 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="text-primary hover:underline transition-colors"
                        >
                          Remove
                        </button>
                        <span className="text-outline-variant">|</span>
                        <button
                          type="button"
                          onClick={() => handleSaveForLater(item)}
                          className="text-primary hover:underline transition-colors"
                        >
                          Save for Later
                        </button>
                      </div>
                    </div>

                    {/* Price + delete icon */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-2">
                      <p className="text-sm font-extrabold text-primary">
                        {formatINRFromPaise((item.unitPricePaise || 0) * (item.qty || 1))}
                      </p>
                      {item.oldPrice && (
                        <p className="text-xs text-on-surface-variant line-through">
                          {item.oldPrice}
                        </p>
                      )}
                      {/* Trash delete button — separate from text "Remove" */}
                      <motion.button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        className="mt-auto p-1.5 rounded-lg text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                        aria-label={`Delete ${item.title}`}
                      >
                        <FiTrash2 className="text-base" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Saved for Later section */}
          {savedItems.length > 0 && (
            <div className="mt-8">
              <h2 className="text-base font-bold text-on-surface mb-3">
                Saved for Later ({savedItems.length})
              </h2>
              <div className="divide-y divide-outline-variant border-t border-b border-outline-variant">
                {savedItems.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4">
                    <div className="w-20 h-16 flex-shrink-0 rounded overflow-hidden bg-surface-variant">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className={["w-full h-full bg-gradient-to-br", item.thumbnailBg || "from-slate-900 via-emerald-800 to-teal-500"].join(" ")} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface line-clamp-2">{item.title}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">By {item.instructor}</p>
                      <button
                        type="button"
                        onClick={() => handleMoveToCart(item)}
                        className="mt-2 text-xs font-semibold text-primary hover:underline"
                      >
                        Move to Cart
                      </button>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-sm font-extrabold text-primary">
                        {formatINRFromPaise(item.unitPricePaise || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clear cart */}
          {items.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-red-600 transition-colors duration-200"
            >
              <FiTrash2 className="text-sm" />
              Clear cart
            </button>
          )}
        </section>

        {/* ── RIGHT: Order summary ─────────────────────────────────── */}
        <aside className="w-full lg:w-72 flex-shrink-0 sticky top-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {/* Total */}
            <div className="mb-4">
              <p className="text-sm text-on-surface-variant font-medium">Total:</p>
              <p className="text-3xl font-extrabold text-on-surface mt-0.5">
                {formatINRFromPaise(totalPaise)}
              </p>
            </div>

            {/* Proceed to Checkout */}
            <motion.button
              type="button"
              disabled={items.length === 0}
              onClick={() => items.length > 0 && navigate("/checkout")}
              whileHover={items.length > 0 ? { scale: 1.02 } : {}}
              whileTap={items.length > 0 ? { scale: 0.98 } : {}}
              className={[
                "w-full h-11 rounded font-extrabold text-sm transition-all duration-200 flex items-center justify-center gap-2",
                items.length === 0
                  ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                  : "bg-primary text-on-primary hover:bg-primary/90",
              ].join(" ")}
            >
              Proceed to Checkout →
            </motion.button>

            <p className="mt-2 text-[11px] text-on-surface-variant text-center flex items-center justify-center gap-1">
              <FiShield className="text-xs" />
              You won't be charged yet
            </p>

            {/* Apply Coupon */}
            <div className="mt-4">
              <div className="flex items-stretch border border-primary rounded">
                <div className="relative flex-1 min-w-0">
                  <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Enter Coupon"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="w-full h-10 pl-8 pr-2 text-sm outline-none bg-surface text-on-surface placeholder:text-on-surface-variant rounded-l"
                  />
                </div>
                <button
                  type="button"
                  className="flex-shrink-0 h-10 px-4 bg-surface text-primary text-sm font-bold border-l border-primary hover:bg-primary/5 transition-colors duration-200 rounded-r"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Promotions */}
            {discountPaise > 0 && (
              <div className="mt-3 text-xs text-emerald-600 font-semibold">
                Promo applied: −{formatINRFromPaise(discountPaise)}
              </div>
            )}
          </motion.div>
        </aside>
      </div>
    </main>
  );
}