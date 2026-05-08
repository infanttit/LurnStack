import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { CartProvider } from "../cart";

export function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <CartProvider>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </CartProvider>
  );
}

