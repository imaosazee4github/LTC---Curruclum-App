import {
  Bell,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import { useState } from "react";

import { useAuth } from "../hooks/useAuth";

const navigation = [
  {
    label: "Dashboard",
    path: "/coach/dashboard",
    icon: LayoutDashboard,
    available: true,
  },
  {
    label: "My Coaching Assignments",
    path: "/coach/assignments",
    icon: BookOpen,
    available: true,
  },
  {
    label: "Student Coaching Record",
    path: "/coach/records",
    icon: Users,
    available: true,
  },
  {
    label: "Record Coaching",
    path: "/coach/record",
    icon: CalendarDays,
    available: true,
  },
  {
    label: "Follow-Up Needed",
    path: "/coach/follow-ups",
    icon: ListChecks,
    available: true,
  },
];

export default function CoachLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [signingOut, setSigningOut] = useState(false);

  const navigate = useNavigate();

  const { profile, signOut } = useAuth();

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await signOut();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Coach sign out failed:", error);

      setSigningOut(false);
    }
  }

  const displayName = profile?.full_name || "Coach";

  const initials = getInitials(displayName);

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-5">
          <NavLink
            to="/coach/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white font-bold text-blue-950">
              LTC
            </div>

            <div>
              <p className="font-bold">Coach Portal</p>

              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Capability Development
              </p>
            </div>
          </NavLink>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        <div className="border-b border-slate-800 px-5 py-5">
          <div className="flex items-center gap-3">
            <ProfilePhoto
              profile={profile}
              initials={initials}
              size="sidebar"
            />

            <div className="min-w-0">
              <p className="truncate font-semibold">{displayName}</p>

              <p className="text-sm text-slate-400">Coach</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Coaching
          </p>

          <div className="mt-3 space-y-1">
            {navigation.map((item) => (
              <NavigationItem
                key={item.path}
                item={item}
                onNavigate={() => setSidebarOpen(false)}
              />
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-3 font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut size={18} />

            {signingOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-sm text-slate-500">LTC Pioneer Programme</p>

              <p className="font-semibold text-blue-950">Coach Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-lg border border-slate-200 p-2 text-slate-600"
            >
              <Bell size={20} />

              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
            </button>

            <div className="hidden text-right sm:block">
              <p className="max-w-48 truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>

              <p className="text-xs text-slate-500">Coach</p>
            </div>

            <ProfilePhoto profile={profile} initials={initials} size="header" />
          </div>
        </header>

        <div className="min-h-[calc(100vh-5rem)]">{children}</div>
      </div>
    </div>
  );
}

function NavigationItem({ item, onNavigate }) {
  const Icon = item.icon;

  if (!item.available) {
    return (
      <div
        title="This section will be available soon."
        className="flex items-center justify-between rounded-lg px-3 py-3 text-slate-500"
      >
        <span className="flex items-center gap-3">
          <Icon size={19} />
          {item.label}
        </span>

        <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] font-semibold uppercase text-slate-400">
          Soon
        </span>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-3 font-medium transition ${
          isActive
            ? "bg-white text-slate-950"
            : "text-slate-300 hover:bg-slate-900 hover:text-white"
        }`
      }
    >
      <Icon size={19} />
      {item.label}
    </NavLink>
  );
}

function ProfilePhoto({ profile, initials, size }) {
  const sizeClass = size === "sidebar" ? "h-11 w-11" : "h-10 w-10";

  if (profile?.profile_photo_url) {
    return (
      <img
        src={profile.profile_photo_url}
        alt={`${profile.full_name || "Coach"} profile`}
        className={`${sizeClass} shrink-0 rounded-full border-2 border-white object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800`}
    >
      {initials}
    </div>
  );
}

function getInitials(name) {
  return String(name || "IN")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}
