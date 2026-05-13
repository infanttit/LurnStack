import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import AppProviders from "../app/providers/AppProviders";

export function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AppProviders>
  );
}

