import "@testing-library/jest-dom";

// JSDOM does not implement these browser APIs, but framer-motion (and other UI
// libs) may rely on them.
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof global.IntersectionObserver === "undefined") {
  global.IntersectionObserver = NoopObserver;
}

if (typeof global.ResizeObserver === "undefined") {
  global.ResizeObserver = NoopObserver;
}
