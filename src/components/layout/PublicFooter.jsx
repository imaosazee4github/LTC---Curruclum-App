import { Link } from "react-router-dom";

export default function PublicFooter() {
  const currentYear =
    new Date().getFullYear();

  return (
    <footer
      id="support"
      className="border-t border-slate-200 bg-blue-950 text-white"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <section>
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-950">
              LTC
            </div>

            <div>
              <p className="text-lg font-bold">
                Pioneer Portal
              </p>

              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Student Tracking System
              </p>
            </div>
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-6 text-blue-100">
            Supporting student learning,
            formation, development and
            readiness throughout the LTC
            Pioneer programme.
          </p>
        </section>

        <FooterSection title="Portal">
          <FooterLink to="/">
            Home
          </FooterLink>

          <FooterLink to="/login">
            Sign In
          </FooterLink>

          <FooterLink to="/student/dashboard">
            Student Dashboard
          </FooterLink>
        </FooterSection>

        <FooterSection title="Programme">
          <FooterAnchor href="/#programme">
            Pioneer Programme
          </FooterAnchor>

          <FooterAnchor href="/#development">
            Development Areas
          </FooterAnchor>

          <FooterAnchor href="/#how-it-works">
            How It Works
          </FooterAnchor>
        </FooterSection>

        <FooterSection title="Help & Support">
          <p className="text-sm leading-6 text-blue-100">
            Contact the LTC administration if
            you need help accessing the portal
            or completing a required activity.
          </p>

          <a
            href="mailto:support@nigerialtc.org"
            className="mt-3 inline-block text-sm font-semibold text-amber-300 transition hover:text-amber-200"
          >
            support@nigerialtc.org
          </a>
        </FooterSection>
      </div>

      <div className="border-t border-blue-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 text-sm text-blue-200 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>
            © {currentYear} Light Training
            Center Nigeria. All rights
            reserved.
          </p>

          <div className="flex flex-wrap gap-5">
            <Link
              to="/privacy"
              className="transition hover:text-white"
            >
              Privacy
            </Link>

            <Link
              to="/terms"
              className="transition hover:text-white"
            >
              Terms
            </Link>

            <a
              href="mailto:support@nigerialtc.org"
              className="transition hover:text-white"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterSection({
  title,
  children,
}) {
  return (
    <section>
      <h2 className="font-bold text-white">
        {title}
      </h2>

      <div className="mt-4 flex flex-col items-start gap-3">
        {children}
      </div>
    </section>
  );
}

function FooterLink({
  to,
  children,
}) {
  return (
    <Link
      to={to}
      className="text-sm text-blue-100 transition hover:text-white"
    >
      {children}
    </Link>
  );
}

function FooterAnchor({
  href,
  children,
}) {
  return (
    <a
      href={href}
      className="text-sm text-blue-100 transition hover:text-white"
    >
      {children}
    </a>
  );
}