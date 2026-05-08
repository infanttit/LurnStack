import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Categories from "../categories/pages/Categories";

jest.useFakeTimers();

afterAll(() => {
  jest.useRealTimers();
});

test("categories page loads and can filter by category", async () => {
  render(<Categories />);

  expect(screen.getByText(/Explore Courses/i)).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(900);
  });

  const initialResults = screen.getByText(/results/i);
  expect(initialResults.textContent).toMatch(/\d+\s+results/);

  fireEvent.click(screen.getByRole("button", { name: /Development/i }));
  expect(screen.getByText(/Category:\s*Development/i)).toBeInTheDocument();
});
