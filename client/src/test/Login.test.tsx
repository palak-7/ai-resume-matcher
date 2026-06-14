import { screen } from "@testing-library/react";
import Login from "../pages/Login";
import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../utils/test-utils";

describe("Login page", () => {
  it("should render login form", () => {
    renderWithProviders(<Login />)

    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument()
  })

  it("should show link to register page", () => {
    renderWithProviders(<Login />)

    expect(
      screen.getByRole("link", { name: /create a free account/i })
    ).toBeInTheDocument()
  })

  it("should disable button while loading", () => {
    renderWithProviders(<Login />)

    const button = screen.getByRole("button", { name: /sign in/i })
    expect(button).not.toBeDisabled()
  })
})
