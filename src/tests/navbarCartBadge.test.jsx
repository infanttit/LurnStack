import React, { useEffect } from "react";
import { screen } from "@testing-library/react";
import SiteNavbar from "../components/layout/SiteNavbar";
import { useCart } from "../cart";
import { renderWithProviders } from "./testUtils";

function Seed() {
  const { addItem } = useCart();
  useEffect(() => {
    addItem({ id: "1", title: "A", unitPricePaise: 100, qty: 2 });
  }, [addItem]);
  return null;
}

test("navbar shows cart badge count", async () => {
  renderWithProviders(
    <>
      <Seed />
      <SiteNavbar />
    </>,
    { route: "/" }
  );

  expect(await screen.findByLabelText("Cart")).toBeInTheDocument();
  expect(screen.getByText("2")).toBeInTheDocument();
});

