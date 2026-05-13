import React from "react";
import { screen, fireEvent, act } from "@testing-library/react";
import Categories from "../categories/pages/Categories";
import { renderWithProviders } from "./testUtils";

jest.useFakeTimers();

afterAll(() => {
  jest.useRealTimers();
});

test("categories page loads and can filter by category", async () => {
  renderWithProviders(<Categories />, { route: "/categories" });

  // Page breadcrumb / header presence
  expect(screen.getByText("Categories")).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(900);
  });

  const initialResults = screen.getByText(/results/i);
  expect(initialResults.textContent).toMatch(/\d+\s+results/);

  // Topic filter is inside a collapsed accordion; open it then toggle the checkbox.
  act(() => {
    fireEvent.click(screen.getByRole("button", { name: /^Topic$/i }));
    // Allow the Framer Motion accordion animation to mount its contents.
    jest.advanceTimersByTime(350);
  });

  const dev = screen.getByRole("checkbox", { name: /^Development$/i });
  act(() => {
    fireEvent.click(dev);
  });
  expect(dev).toBeChecked();
});
