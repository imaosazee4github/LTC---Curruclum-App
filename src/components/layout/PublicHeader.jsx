import { useState } from "react";
import { Link } from "react-router-dom";

export default function PublicHeader() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-950 text-sm font-bold text-white">
            LTC
          </div>

          <div>
            <p className="text-lg font-bold leading-tight text-blue-950">
              Pioneer Portal
            </p>

            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Student Tracking System
            </p>
          </div>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 md:flex"
        >
          <a
            href="#programme"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-900"
          >
            Programme
          </a>

          <a
            href="#development"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-900"
          >
            Development Areas
          </a>

          <a
            href="#how-it-works"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-900"
          >
            How It Works
          </a>

          <a
            href="#support"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-900"
          >
            Support
          </a>

          <Link
            to="/login"
            className="rounded-lg border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
          >
            Sign In
          </Link>
        </nav>

        <button
          type="button"
          onClick={() =>
            setMenuOpen(
              (currentValue) =>
                !currentValue,
            )
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          className="rounded-lg border border-slate-300 p-2 text-slate-700 md:hidden"
        >
          {menuOpen ? (
            <CloseIcon />
          ) : (
            <MenuIcon />
          )}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          className="border-t border-slate-200 bg-white px-5 py-4 md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            <MobileLink
              href="#programme"
              onClick={closeMenu}
            >
              Programme
            </MobileLink>

            <MobileLink
              href="#development"
              onClick={closeMenu}
            >
              Development Areas
            </MobileLink>

            <MobileLink
              href="#how-it-works"
              onClick={closeMenu}
            >
              How It Works
            </MobileLink>

            <MobileLink
              href="#support"
              onClick={closeMenu}
            >
              Support
            </MobileLink>

            <Link
              to="/login"
              onClick={closeMenu}
              className="mt-2 rounded-lg bg-blue-950 px-4 py-3 text-center font-semibold text-white"
            >
              Sign In
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="rounded-lg px-4 py-3 font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-900"
    >
      {children}
    </a>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}