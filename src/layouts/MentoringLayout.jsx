import {
  Bell,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useState,
} from "react";

import { useAuth } from "../hooks/useAuth";

const navigationByRole = {
  mentor_department: [
    {
      label: "Dashboard",
      path:
        "/mentor-department/dashboard",
      icon: LayoutDashboard,
      available: true,
    },
    {
      label: "Mentor Assignments",
      path:
        "/mentor-department/assignments",
      icon: UserRoundCheck,
      available: true,
    },
    {
      label: "Mentor Reports",
      path:
        "/mentor-department/reports",
      icon: ClipboardList,
      available: true,
    },
    {
      label: "Follow-Up Actions",
      path:
        "/mentor-department/follow-ups",
      icon: ListChecks,
      available: false,
    },
  ],

  mentor: [
    {
      label: "Dashboard",
      path: "/mentor/dashboard",
      icon: LayoutDashboard,
      available: true,
    },
    {
      label: "My Mentees",
      path: "/mentor/mentees",
      icon: Users,
      available: true,
    },
    {
      label: "My Reports",
      path: "/mentor/reports",
      icon: ClipboardList,
      available: true,
    },
    {
      label: "My Actions",
      path: "/mentor/actions",
      icon: ListChecks,
      available: false,
    },
  ],
};

const portalDetails = {
  mentor_department: {
    title: "Mentor Department",
    subtitle: "Mentoring Operations",
    homePath:
      "/mentor-department/dashboard",
  },

  mentor: {
    title: "Mentor Portal",
    subtitle: "Student Development",
    homePath: "/mentor/dashboard",
  },
};

export default function MentoringLayout({
  children,
}) {
  const navigate = useNavigate();

  const {
    profile,
    role,
    signOut,
  } = useAuth();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [signingOut, setSigningOut] =
    useState(false);

  const portal =
    portalDetails[role] ||
    portalDetails.mentor;

  const navigation =
    navigationByRole[role] || [];

  async function handleSignOut() {
    setSigningOut(true);

    try {
      await signOut();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Unable to sign out:",
        error,
      );

      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <MentoringSidebar
        open={menuOpen}
        onClose={() =>
          setMenuOpen(false)
        }
        profile={profile}
        portal={portal}
        navigation={navigation}
        signingOut={signingOut}
        onSignOut={handleSignOut}
      />

      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() =>
            setMenuOpen(false)
          }
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
        />
      )}

      <div className="lg:pl-72">
        <MentoringHeader
          profile={profile}
          portal={portal}
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

function MentoringSidebar({
  open,
  onClose,
  profile,
  portal,
  navigation,
  signingOut,
  onSignOut,
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-indigo-900 bg-slate-950 text-white transition-transform duration-200 lg:translate-x-0 ${
        open
          ? "translate-x-0"
          : "-translate-x-full"
      }`}
    >
      <div className="flex h-[4.5rem] items-center justify-between border-b border-slate-800 px-5">
        <Link
          to={portal.homePath}
          onClick={onClose}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold text-slate-950">
            LTC
          </div>

          <div>
            <p className="font-bold">
              {portal.title}
            </p>

            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">
              {portal.subtitle}
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="rounded-md p-2 text-slate-300 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-slate-800 p-5">
        <div className="flex items-center gap-3">
          <ProfilePhoto
            profile={profile}
            size="sidebar"
          />

          <div className="min-w-0">
            <p className="truncate font-semibold">
              {profile?.full_name ||
                portal.title}
            </p>

            <p className="mt-1 truncate text-xs text-slate-400">
              {formatRole(
                profile?.role,
              )}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Mentoring
        </p>

        <div className="mt-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            if (!item.available) {
              return (
                <div
                  key={item.path}
                  title="This section will be available soon."
                  className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-500"
                >
                  <Icon className="h-5 w-5" />

                  <span className="flex-1">
                    {item.label}
                  </span>

                  <span className="rounded-full bg-slate-800 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({
                  isActive,
                }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-white text-slate-950"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                <Icon className="h-5 w-5" />

                <span>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-3 text-sm font-semibold transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />

          {signingOut
            ? "Signing out..."
            : "Sign Out"}
        </button>
      </div>
    </aside>
  );
}

function MentoringHeader({
  profile,
  portal,
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
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <p className="text-sm text-slate-500">
            LTC Pioneer Programme
          </p>

          <p className="font-semibold text-slate-950">
            {portal.title}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg border border-slate-200 p-2 text-slate-600"
        >
          <Bell className="h-5 w-5" />

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500" />
        </button>

        <div className="hidden text-right sm:block">
          <p className="max-w-48 truncate text-sm font-semibold text-slate-800">
            {profile?.full_name ||
              portal.title}
          </p>

          <p className="text-xs text-slate-500">
            {formatRole(
              profile?.role,
            )}
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
    size === "sidebar"
      ? "h-11 w-11"
      : "h-10 w-10";

  if (profile?.profile_photo_url) {
    return (
      <img
        src={profile.profile_photo_url}
        alt={`${profile.full_name || "Portal user"} profile`}
        className={`${sizeClass} shrink-0 rounded-full border-2 border-white/70 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800`}
    >
      {getInitials(
        profile?.full_name,
      )}
    </div>
  );
}

function getInitials(fullName) {
  if (!fullName) {
    return "LTC";
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

function formatRole(role) {
  if (!role) {
    return "";
  }

  return String(role)
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}