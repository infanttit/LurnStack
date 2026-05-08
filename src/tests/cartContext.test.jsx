import React, { useEffect } from "react";
import { screen, waitFor, act } from "@testing-library/react";
import { CartProvider, useCart } from "../cart";
import { render } from "@testing-library/react";

function Harness({ onReady }) {
  const cart = useCart();
  useEffect(() => {
    onReady?.(cart);
  }, [cart, onReady]);
  return (
    <div>
      <div data-testid="count">{cart.itemCount}</div>
      <div data-testid="subtotal">{cart.subtotalPaise}</div>
    </div>
  );
}

test("cart add/remove/qty updates count and subtotal", async () => {
  let api = null;
  render(
    <CartProvider>
      <Harness onReady={(c) => (api = c)} />
    </CartProvider>
  );

  expect(screen.getByTestId("count")).toHaveTextContent("0");
  expect(screen.getByTestId("subtotal")).toHaveTextContent("0");

  await waitFor(() => expect(api).not.toBeNull());

  await act(async () => {
    api.addItem({ id: "1", title: "Course A", unitPricePaise: 10000, qty: 1 });
  });
  await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("1"));
  await waitFor(() => expect(screen.getByTestId("subtotal")).toHaveTextContent("10000"));

  await act(async () => {
    api.addItem({ id: "1", title: "Course A", unitPricePaise: 10000, qty: 1 });
  });
  await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("2"));
  await waitFor(() => expect(screen.getByTestId("subtotal")).toHaveTextContent("20000"));

  await act(async () => {
    api.setQty("1", 5);
  });
  await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("5"));
  await waitFor(() => expect(screen.getByTestId("subtotal")).toHaveTextContent("50000"));

  await act(async () => {
    api.removeItem("1");
  });
  await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("0"));
  await waitFor(() => expect(screen.getByTestId("subtotal")).toHaveTextContent("0"));
});
