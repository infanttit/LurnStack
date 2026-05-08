import React, { useEffect } from "react";
import { screen, fireEvent } from "@testing-library/react";
import { render } from "@testing-library/react";
import { CartProvider, useCart } from "../cart";
import CartPage from "../cart/pages/CartPage";
import { MemoryRouter } from "react-router-dom";

function SeedCart() {
  const { addItem } = useCart();
  useEffect(() => {
    addItem({
      id: "101",
      title: "Test Course",
      instructor: "Test Instructor",
      unitPricePaise: 1599,
      qty: 1,
      thumbnail: null,
      thumbnailBg: "from-slate-800 via-emerald-800 to-teal-500",
    });
  }, [addItem]);
  return null;
}

test("cart page shows items and allows quantity + remove", async () => {
  render(
    <CartProvider>
      <MemoryRouter>
        <SeedCart />
        <CartPage />
      </MemoryRouter>
    </CartProvider>
  );

  expect(await screen.findByText(/Checkout/i)).toBeInTheDocument();
  expect(screen.getByText(/Test Course/i)).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText(/Increase quantity/i));
  expect(screen.getByText(/Your Cart \(2 items\)/i)).toBeInTheDocument();

  fireEvent.click(screen.getByText(/Remove/i));
  expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
});

