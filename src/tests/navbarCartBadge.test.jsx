import React, { useEffect } from "react";
import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SiteNavbar from "../components/layout/SiteNavbar";
import { CartProvider, useCart } from "../cart";

function Seed() {
  const { addItem } = useCart();
  useEffect(() => {
    addItem({ id: "1", title: "A", unitPricePaise: 100, qty: 2 });
  }, [addItem]);
  return null;
}

test("navbar shows cart badge count", async () => {
  render(
    <CartProvider>
      <MemoryRouter>
        <Seed />
        <SiteNavbar />
      </MemoryRouter>
    </CartProvider>
  );

  expect(await screen.findByLabelText("Cart")).toBeInTheDocument();
  expect(screen.getByText("2")).toBeInTheDocument();
});

