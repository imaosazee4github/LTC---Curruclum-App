import { useState } from "react";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import {
  useStudentProfile,
} from "../hooks/useStudentProfile";

const primaryNavigation = [
  {
    label: "Dashboard",
    path: "/student/dashboard",
    icon: "⌂",
    available: true,
  },
  {
    label: "My Profile",
    path: "/student/profile",
    icon: "○",
    available: true,
  },
  {
    label: "My Learning",
    path: "/student/learning",
    icon: "▤",
    available: false,
  },
  {
    label: "My Responsibilities",
    path: "/student/responsibilities",
    icon: "✓",
    available: false,
  },
  {
    label: "My Campus Life",
    path: "/student/campus-life",
    icon: "◇",
    available: false,
  },
  {
    label: "My Support",
    path: "/student/support",
    icon: "♡",
    available: false,
  },
  {
    label: "My Conduct",
    path: "/student/conduct",
    icon: "⚖",
    available: false,
  },
  {
    label: "My Reflection",
    path: "/student/reflection",
    icon: "✎",
    available: false,
  },
  {
    label: "My Progress",
    path: "/student/progress",
    icon: "↗",
    available: false,
  },
  {
    label: "To Do",
    path: "/student/tasks",
    icon: "☑",
    available: false,
  },
];

export default function StudentLayout({
  children,
}) {
  const navigate = useNavigate();

  const {
    profile,
    signOut,
  } = useAuth();

  const {
    studentProfile,
  } = useStudentProfile();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [signingOut, setSigningOut] =
    useState(false);

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await signOut();

      navigate(
        "/login",
        {
          replace: true,
        },
      );
    } catch (error) {
      console.error(
        "Unable to sign out:",
        error,
      );

      setSigningOut(false);
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentSidebar
        open={menuOpen}
        onClose={closeMenu}
        profile={profile}
        studentProfile={studentProfile}
        signingOut={signingOut}
        onSignOut={handleSignOut}
      />

      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMenu}
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
        />
      )}

      <div className="lg:pl-72">
        <StudentHeader
          profile={profile}
          onOpenMenu={() =>
            setMenuOpen(true)
          }
        />

        <div className="min-h-[calc(100vh-4.5rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}

function StudentSidebar({
  open,
  onClose,
  profile,
  studentProfile,
  signingOut,
  onSignOut,
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-blue-900 bg-blue-950 text-white transition-transform duration-200 lg:translate-x-0 ${
        open
          ? "translate-x-0"
          : "-translate-x-full"
      }`}
    >
      <div className="flex h-[4.5rem] items-center justify-between border-b border-blue-900 px-5">
        <Link
          to="/student/dashboard"
          onClick={onClose}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-950">
            LTC
          </div>

          <div>
            <p className="font-bold">
              Pioneer Portal
            </p>

            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">
              Student Portal
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="rounded-md p-2 text-blue-100 lg:hidden"
        >
          ×
        </button>
      </div>

      <div className="border-b border-blue-900 p-5">
        <div className="flex items-center gap-3">
          <ProfilePhoto
            profile={profile}
            size="small"
          />

          <div className="min-w-0">
            <p className="truncate font-semibold">
              {profile?.full_name ||
                "Pioneer Student"}
            </p>

            <p className="mt-1 truncate text-xs text-blue-200">
              {studentProfile
                ?.student_number ||
                "Student number pending"}
            </p>
          </div>
        </div>
      </div>

      <nav
        aria-label="Student navigation"
        className="flex-1 overflow-y-auto px-4 py-5"
      >
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-blue-300">
          Student Portal
        </p>

        <div className="mt-3 space-y-1">
          {primaryNavigation.map(
            (item) =>
              item.available ? (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({
                    isActive,
                  }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-white text-blue-950"
                        : "text-blue-100 hover:bg-blue-900 hover:text-white"
                    }`
                  }
                >
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center text-base"
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </NavLink>
              ) : (
                <div
                  key={item.path}
                  className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-3 text-sm text-blue-300"
                  title="This section will be available soon."
                >
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center text-base"
                  >
                    {item.icon}
                  </span>

                  <span className="flex-1">
                    {item.label}
                  </span>

                  <span className="rounded-full bg-blue-900 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-blue-200">
                    Soon
                  </span>
                </div>
              ),
          )}
        </div>
      </nav>

      <div className="border-t border-blue-900 p-4">
        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className="w-full rounded-lg border border-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingOut
            ? "Signing out..."
            : "Sign Out"}
        </button>
      </div>
    </aside>
  );
}

function StudentHeader({
  profile,
  onOpenMenu,
}) {
  return (
    <header className="sticky top-0 z-20 flex h-[4.5rem] items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="rounded-lg border border-slate-300 p-2 text-slate-700 lg:hidden"
        >
          <MenuIcon />
        </button>

        <div>
          <p className="text-sm text-slate-500">
            LTC Pioneer Programme
          </p>

          <p className="font-semibold text-blue-950">
            Student Portal
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg border border-slate-200 p-2 text-slate-600"
        >
          <BellIcon />

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500" />
        </button>

        <div className="hidden text-right sm:block">
          <p className="max-w-48 truncate text-sm font-semibold text-slate-800">
            {profile?.full_name ||
              "Pioneer Student"}
          </p>

          <p className="text-xs text-slate-500">
            Student
          </p>
        </div>

        <ProfilePhoto
          profile={profile}
          size="header"
        />
      </div>
    </header>
  );
}

function ProfilePhoto({
  profile,
  size,
}) {
  const sizeClass =
    size === "small"
      ? "h-11 w-11"
      : "h-10 w-10";

  if (profile?.profile_photo_url) {
    return (
      <img
        src={profile.profile_photo_url}
        alt={`${profile.full_name || "Student"} profile`}
        className={`${sizeClass} shrink-0 rounded-full border-2 border-white/70 object-cover`}
      />
    );
  }

  return (
    <div
      aria-label="Student profile initials"
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800`}
    >
      {getInitials(
        profile?.full_name,
      )}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
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

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function getInitials(fullName) {
  if (!fullName) {
    return "ST";
  }

  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((name) =>
      name.charAt(0).toUpperCase(),
    )
    .join("");
}