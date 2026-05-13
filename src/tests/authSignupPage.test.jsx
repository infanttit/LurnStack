import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import SignupPage from "../auth/pages/SignupPage";
import { renderWithProviders } from "./testUtils";

test("signup shows validation styles on empty submit", async () => {
  renderWithProviders(<SignupPage />, { route: "/signup" });

  // Must accept terms first; otherwise the form short-circuits with a toast
  // and does not run field validation.
  const agree = await screen.findByRole("checkbox");
  fireEvent.click(agree);

  const submit = await screen.findByRole("button", { name: /create account/i });
  fireEvent.click(submit);

  const nameInput = screen.getByLabelText(/full name/i);
  const emailInput = screen.getByLabelText(/email address/i);
  const passwordInput = screen.getByLabelText(/^password$/i);

  await waitFor(() => expect(nameInput.className).toMatch(/border-red-400/));
  await waitFor(() => expect(emailInput.className).toMatch(/border-red-400/));
  await waitFor(() => expect(passwordInput.className).toMatch(/border-red-400/));
});
