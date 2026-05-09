const CART_FLY_EVENT = "lurnstack:cartFly";

export function emitCartFlyFromElement(fromEl, thumbnailUrl = null, title = null) {
  if (!fromEl || typeof window === "undefined") return;
  const rect = fromEl.getBoundingClientRect?.();
  if (!rect) return;
  window.dispatchEvent(
    new CustomEvent(CART_FLY_EVENT, {
      detail: {
        fromRect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
        thumbnailUrl: thumbnailUrl,
        title: title,
      },
    })
  );
}

export function onCartFly(handler) {
  if (typeof window === "undefined") return () => {};
  const wrapped = (e) => handler?.(e?.detail);
  window.addEventListener(CART_FLY_EVENT, wrapped);
  return () => window.removeEventListener(CART_FLY_EVENT, wrapped);
}