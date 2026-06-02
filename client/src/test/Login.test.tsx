import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import Login from "../pages/Login";
import { describe, it, expect } from "vitest";
const renderLogin = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>,
  );

describe("Login page", () => {
  it("should render login form", () => {
    renderLogin();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("should show link to register page", () => {
    renderLogin();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it("should disable button while loading", () => {
    renderLogin();
    const button = screen.getByRole("button", { name: /sign in/i });
    expect(button).not.toBeDisabled();
  });
});
