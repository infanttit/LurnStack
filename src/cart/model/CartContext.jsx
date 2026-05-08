import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const CartContext = createContext(null);

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function loadInitialState() {
  if (typeof window === "undefined") return { itemsById: {} };
  const raw = window.localStorage.getItem("lurnstack:cart:v1");
  const parsed = safeParse(raw);
  if (!parsed?.itemsById || typeof parsed.itemsById !== "object") return { itemsById: {} };
  return { itemsById: parsed.itemsById };
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const item = action.item;
      if (!item?.id) return state;
      const existing = state.itemsById[item.id];
      const nextQty = (existing?.qty || 0) + (item.qty || 1);
      return {
        ...state,
        itemsById: {
          ...state.itemsById,
          [item.id]: { ...existing, ...item, qty: nextQty },
        },
      };
    }
    case "REMOVE_ITEM": {
      const id = action.id;
      if (!id || !state.itemsById[id]) return state;
      const next = { ...state.itemsById };
      delete next[id];
      return { ...state, itemsById: next };
    }
    case "SET_QTY": {
      const { id, qty } = action;
      if (!id || !state.itemsById[id]) return state;
      const safeQty = Math.max(1, Math.min(99, Number(qty) || 1));
      return {
        ...state,
        itemsById: { ...state.itemsById, [id]: { ...state.itemsById[id], qty: safeQty } },
      };
    }
    case "CLEAR": {
      return { itemsById: {} };
    }
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialState);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("lurnstack:cart:v1", JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => {
    const items = Object.values(state.itemsById);
    const itemCount = items.reduce((sum, i) => sum + (i.qty || 0), 0);
    const subtotalPaise = items.reduce(
      (sum, i) => sum + (Number(i.unitPricePaise) || 0) * (i.qty || 0),
      0
    );

    return {
      items,
      itemCount,
      subtotalPaise,
      addItem: (item) => dispatch({ type: "ADD_ITEM", item }),
      removeItem: (id) => dispatch({ type: "REMOVE_ITEM", id }),
      setQty: (id, qty) => dispatch({ type: "SET_QTY", id, qty }),
      clear: () => dispatch({ type: "CLEAR" }),
    };
  }, [state.itemsById]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider />");
  return ctx;
}
