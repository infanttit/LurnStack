import { useState } from "react";
import { FiLock, FiMail, FiCreditCard, FiShield } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCart } from "../model/CartContext";
import { formatINRFromPaise } from "../lib/cartUtils";

// ── Social icon button — circular border, no fill ────────────
function SocialBtn({ children, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:border-primary/50 hover:bg-surface-container-low transition-all duration-200"
    >
      {children}
    </button>
  );
}

export default function CheckoutPage() {
  const { items, itemCount, subtotalPaise } = useCart();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("all");

  const totalPaise = subtotalPaise;

  const visibleItems =
    selectedCourseId === "all"
      ? items
      : items.filter((i) => String(i.id) === String(selectedCourseId));

  const handleContinue = () => {
    if (email.trim()) setStep(2);
  };

  return (
    <main className="max-w-container-max mx-auto px-margin-desktop py-10">
      {/* Page heading */}
      <h1 className="font-h2 text-h2 text-on-surface mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-16 items-start">

        {/* ── LEFT ─────────────────────────────────────────────── */}
        <section className="flex-1 min-w-0">

          {/* ── STEP 1 ── */}
          <div className="border-t border-outline-variant">
            {/* Step 1 header */}
            <div className="flex items-center justify-between py-4">
              <h2 className="text-base font-bold text-on-surface">
                1. Log in or create an account
              </h2>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {/* Step 1 — expanded */}
            {step === 1 && (
              <div className="pb-8">
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6 max-w-xl">
                  A Udemy account is required to access your purchased courses. Please
                  verify that your email address is correct, as we'll use it to send your order
                  confirmation. By signing up, you agree to our{" "}
                  <Link to="/terms" className="text-primary underline hover:no-underline">
                    Terms of Use
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary underline hover:no-underline">
                    Privacy Policy
                  </Link>
                  .
                </p>

                {/* Email + "or" + social on ONE row */}
                <div className="flex items-center gap-4 flex-wrap">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                    className="h-12 w-64 rounded border border-outline-variant bg-surface px-4 text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />

                  <span className="text-sm text-on-surface-variant font-medium">or</span>

                  <div className="flex items-center gap-2">
                    <SocialBtn label="Continue with Google">
                      <FcGoogle className="text-xl" />
                    </SocialBtn>
                    <SocialBtn label="Continue with Facebook">
                      <FaFacebook className="text-xl text-[#1877F2]" />
                    </SocialBtn>
                    <SocialBtn label="Continue with Apple">
                      <FaApple className="text-xl text-on-surface" />
                    </SocialBtn>
                  </div>
                </div>

                {/* No password required */}
                <p className="mt-2 text-xs text-on-surface-variant">No password required</p>

                {/* Continue button */}
                <button
                  type="button"
                  onClick={handleContinue}
                  className="mt-5 w-full max-w-sm h-12 rounded bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 transition-colors duration-200"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 1 — collapsed: show entered email */}
            {step > 1 && (
              <div className="pb-4 flex items-center gap-2 text-sm text-on-surface-variant">
                <FiMail className="text-base flex-shrink-0" />
                <span>{email}</span>
              </div>
            )}
          </div>

          {/* ── STEP 2 ── */}
          <div
            className={`border-t border-outline-variant ${
              step < 2 ? "opacity-60 pointer-events-none select-none" : ""
            }`}
          >
            {/* Step 2 header */}
            <div className="flex items-center justify-between py-4">
              <h2 className="text-base font-bold text-on-surface">
                2. Billing address &amp; Payment method
              </h2>
              {step < 2 && <FiLock className="text-on-surface-variant text-base" />}
            </div>

            {/* Step 2 — expanded */}
            {step === 2 && (
              <div className="pb-8 space-y-4 max-w-sm">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-11 rounded border border-outline-variant bg-surface px-3 text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-11 rounded border border-outline-variant bg-surface px-3 text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                {/* Country */}
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full h-11 rounded border border-outline-variant bg-surface px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                >
                  <option value="">Select Country</option>
                  <option value="IN">India</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>

                {/* State */}
                <input
                  type="text"
                  placeholder="State / Province"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full h-11 rounded border border-outline-variant bg-surface px-3 text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />

                {/* Payment method */}
                <div className="pt-2">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FiCreditCard className="text-sm" />
                    Payment method
                  </p>
                  <div className="space-y-2">
                    {[
                      { id: "card",     label: "Credit / Debit Card", icon: "💳", desc: "Visa, Mastercard, RuPay, Amex" },
                      { id: "razorpay", label: "Razorpay",            icon: "🦚", desc: "UPI, Netbanking, Wallets" },
                      { id: "stripe",   label: "Stripe Checkout",     icon: "⚡", desc: "International cards & more" },
                    ].map((m) => (
                      <label
                        key={m.id}
                        className={[
                          "flex items-start gap-3 p-3 rounded border transition-all duration-200 cursor-pointer",
                          selectedPayment === m.id
                            ? "border-primary bg-primary/5"
                            : "border-outline-variant hover:border-primary/50 hover:bg-surface-container-low",
                        ].join(" ")}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={m.id}
                          checked={selectedPayment === m.id}
                          onChange={() => setSelectedPayment(m.id)}
                          className="accent-primary mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-semibold text-on-surface flex items-center gap-2">
                            <span>{m.icon}</span> {m.label}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-0.5">{m.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full h-12 rounded bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 transition-colors duration-200 mt-2"
                >
                  Complete Purchase →
                </button>
              </div>
            )}
          </div>

          {/* ── ORDER DETAILS — below steps, exactly like screenshot ── */}
          {items.length > 0 && (
            <div className="mt-4 border-t border-outline-variant pt-6">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
                <h3 className="text-sm font-bold text-on-surface">
                  Order details ({itemCount} {itemCount === 1 ? "course" : "courses"})
                </h3>

                {items.length > 1 ? (
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="h-9 rounded-lg border border-outline-variant bg-surface px-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    aria-label="Select course"
                  >
                    <option value="all">All courses</option>
                    {items.map((i) => (
                      <option key={i.id} value={String(i.id)}>
                        {i.title}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>

              <div className="space-y-5">
                {visibleItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    {/* Small square thumbnail */}
                    <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-surface-variant">
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

                    {/* Course title */}
                    <p className="flex-1 text-sm font-semibold text-on-surface line-clamp-2 leading-snug">
                      {item.title}
                    </p>

                    {/* Price — right-aligned, tabular numerals */}
                    <p className="flex-shrink-0 text-sm font-bold text-on-surface tabular-nums">
                      {formatINRFromPaise((item.unitPricePaise || 0) * (item.qty || 1))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── RIGHT: Order summary ───────────────────────────────── */}
        <aside className="w-full lg:w-60 flex-shrink-0 sticky top-24">
          <h2 className="text-base font-extrabold text-on-surface mb-5">
            Order summary
          </h2>

          {/* Original price */}
          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-on-surface-variant">Original Price:</span>
            <span className="text-on-surface font-semibold tabular-nums">
              {formatINRFromPaise(subtotalPaise)}
            </span>
          </div>

          {/* Divider + bold total */}
          <div className="border-t border-outline-variant pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-on-surface">
                Total ({itemCount} {itemCount === 1 ? "course" : "courses"}):
              </span>
              <span className="text-base font-extrabold text-on-surface tabular-nums">
                {formatINRFromPaise(totalPaise)}
              </span>
            </div>
          </div>

          {/* Money-back guarantee */}
          <div className="mt-5 flex items-start gap-2 text-xs text-on-surface-variant">
            <FiShield className="text-sm flex-shrink-0 mt-0.5" />
            <span>30-day money-back guarantee</span>
          </div>
        </aside>

      </div>
    </main>
  );
}
