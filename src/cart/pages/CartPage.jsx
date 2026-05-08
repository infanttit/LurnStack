import { useMemo, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useCart } from "../model/CartContext";
import { formatINRFromPaise } from "../lib/cartUtils";

function CourseThumb({ item }) {
  if (item.thumbnail) {
    return (
      <img
        src={item.thumbnail}
        alt={item.title}
        className="w-full h-full object-cover"
      />
    );
  }
  return (
    <div
      className={[
        "w-full h-full bg-gradient-to-br",
        item.thumbnailBg || "from-slate-900 via-emerald-800 to-teal-500",
      ].join(" ")}
    />
  );
}

function QtyControl({ value, onChange }) {
  return (
    <div className="inline-flex items-center rounded-xl border border-outline-variant bg-surface overflow-hidden">
      <button
        type="button"
        className="w-9 h-9 text-on-surface-variant hover:bg-surface-container-low transition-colors"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <div className="w-10 text-center text-sm font-semibold text-on-surface">
        {value}
      </div>
      <button
        type="button"
        className="w-9 h-9 text-on-surface-variant hover:bg-surface-container-low transition-colors"
        onClick={() => onChange(Math.min(99, value + 1))}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export default function CartPage() {
  const { items, itemCount, subtotalPaise, removeItem, setQty, clear } = useCart();
  const [payment, setPayment] = useState("card");

  const discountPaise = useMemo(() => 0, []);
  const totalPaise = Math.max(0, subtotalPaise - discountPaise);

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-16">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-h2 text-h2 text-primary">Checkout</h1>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
            Your Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            Clear cart
          </button>
        )}
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: items */}
        <section className="lg:col-span-8 space-y-5">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-outline-variant bg-surface p-8 text-on-surface-variant">
              Your cart is empty. Add a course from the landing page to get
              started.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-outline-variant bg-surface p-5 flex gap-5"
              >
                <div className="w-28 h-20 rounded-xl overflow-hidden bg-surface-variant flex-shrink-0">
                  <CourseThumb item={item} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-base font-extrabold text-on-surface leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Instructor: {item.instructor}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold text-on-surface">
                        {formatINRFromPaise((item.unitPricePaise || 0) * (item.qty || 1))}
                      </div>
                      {item.oldPrice && (
                        <div className="text-xs text-on-surface-variant line-through">
                          {item.oldPrice}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <QtyControl
                        value={item.qty || 1}
                        onChange={(q) => setQty(item.id, q)}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                      >
                        <FiTrash2 className="text-[16px]" />
                        Remove
                      </button>
                    </div>

                    <div className="text-xs text-on-surface-variant">
                      Secure checkout • Instant access
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Right: summary */}
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-outline-variant bg-surface p-6 sticky top-24">
            <h2 className="text-lg font-extrabold text-on-surface">
              Order Summary
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span className="font-semibold text-on-surface">
                  {formatINRFromPaise(subtotalPaise)}
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>Discounts</span>
                <span className="font-semibold text-red-600">
                  -{formatINRFromPaise(discountPaise)}
                </span>
              </div>
              <div className="border-t border-outline-variant pt-3 flex items-center justify-between">
                <span className="font-extrabold text-on-surface">Total</span>
                <span className="font-extrabold text-on-surface">
                  {formatINRFromPaise(totalPaise)}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                Payment method
              </div>

              <div className="mt-3 space-y-2">
                {[
                  { id: "card", label: "Credit / Debit Card" },
                  { id: "stripe", label: "Stripe Checkout" },
                  { id: "razorpay", label: "Razorpay" },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={[
                      "flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer",
                      payment === m.id
                        ? "border-primary bg-primary/5"
                        : "border-outline-variant hover:bg-surface-container-low",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={payment === m.id}
                      onChange={(e) => setPayment(e.target.value)}
                    />
                    <span className="text-sm font-semibold text-on-surface">
                      {m.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <input
                type="text"
                placeholder="Promo code"
                className="flex-1 h-11 rounded-xl border border-outline-variant bg-surface px-3 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                className="h-11 px-4 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
              >
                Apply
              </button>
            </div>

            <button
              type="button"
              disabled={items.length === 0}
              className={[
                "mt-4 w-full h-12 rounded-xl font-extrabold text-sm transition-all",
                items.length === 0
                  ? "bg-surface-variant text-on-surface-variant cursor-not-allowed"
                  : "bg-primary text-on-primary hover:shadow-lg hover:shadow-primary/20 active:scale-[0.99]",
              ].join(" ")}
            >
              Complete Purchase →
            </button>

            <p className="mt-3 text-[10px] text-on-surface-variant text-center">
              By completing your purchase you agree to our Terms of Service.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
