import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Eye,
  History,
  LogIn,
  LogOut,
  Menu,
  ScanEye,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import DisclaimerBanner from "./DisclaimerBanner";

const NAV_LINKS = [
  { to: "/", label: "Home", icon: Eye },
  { to: "/analyze", label: "New Screening", icon: ScanEye },
  { to: "/history", label: "History", icon: History, protected: true },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const {
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    principal,
    login,
    logout,
  } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}…${principal.slice(-4)}`
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 min-w-0 shrink-0"
              data-ocid="nav.logo_link"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Eye
                  className="h-4.5 w-4.5 text-primary-foreground"
                  strokeWidth={2}
                />
              </div>
              <span className="font-display font-bold text-lg text-foreground tracking-tight">
                OcuScreen<span className="text-primary">+</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {NAV_LINKS.filter((l) => !l.protected || isAuthenticated).map(
                ({ to, label, icon: Icon }) => {
                  const active = location.pathname === to;
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      data-ocid={`nav.${label.toLowerCase().replace(/\s+/g, "_")}_link`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  );
                },
              )}
            </nav>

            {/* Auth controls */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-sm text-muted-foreground font-mono">
                    <User className="h-3.5 w-3.5" />
                    <span>{shortPrincipal}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="gap-1.5"
                    data-ocid="nav.logout_button"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={login}
                  disabled={isInitializing || isLoggingIn}
                  className="gap-1.5"
                  data-ocid="nav.login_button"
                >
                  <LogIn className="h-4 w-4" />
                  {isInitializing
                    ? "Loading…"
                    : isLoggingIn
                      ? "Signing in…"
                      : "Sign in"}
                </Button>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              data-ocid="nav.mobile_menu_toggle"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.filter((l) => !l.protected || isAuthenticated).map(
              ({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    data-ocid={`nav.mobile_${label.toLowerCase().replace(/\s+/g, "_")}_link`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              },
            )}
            <div className="pt-2 border-t border-border mt-1">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  className="w-full gap-2 justify-start"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  data-ocid="nav.mobile_logout_button"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out ({shortPrincipal})
                </Button>
              ) : (
                <Button
                  className="w-full gap-2 justify-start"
                  onClick={() => {
                    login();
                    setMobileOpen(false);
                  }}
                  disabled={isInitializing || isLoggingIn}
                  data-ocid="nav.mobile_login_button"
                >
                  <LogIn className="h-4 w-4" />
                  {isInitializing
                    ? "Loading…"
                    : "Sign in with Internet Identity"}
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Main */}
      <main className="flex-1 bg-background">{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
                <Eye className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-display font-semibold text-foreground">
                OcuScreen+
              </span>
              <span>
                — Research screening tool. Not for clinical diagnosis.
              </span>
            </div>
            <span>
              © {new Date().getFullYear()}. Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
