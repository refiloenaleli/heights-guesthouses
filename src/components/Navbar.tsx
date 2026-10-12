import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useGuestHouse } from "@/lib/guest-house-context";
import { useSiteImage } from "@/lib/site-images-context";
import ghLogo from "@/assets/gh-logo.jpg";
import nhLogo from "@/assets/nh-logo-transparent.png";

const navLinks = [
  { to: "/home" as const, label: "Home" },
  { to: "/accommodation" as const, label: "Accommodation" },
  { to: "/dining" as const, label: "Dining & Menu" },
  { to: "/gallery" as const, label: "Gallery" },
  { to: "/about" as const, label: "About" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeHouse, houseName, phoneNumber } = useGuestHouse();
  const location = useLocation();
  const isGateway = location.pathname === "/";
  const isHeroRoute =
    location.pathname === "/home" ||
    location.pathname === "/accommodation" ||
    location.pathname === "/about";
  const logo = useSiteImage(
    `logo.${activeHouse}`,
    activeHouse === "greater-heights" ? ghLogo : nhLogo,
  );

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  if (isGateway) {
    return (
      <header className="fixed inset-x-0 top-0 z-50">
        <div aria-hidden="true" className="h-2 bg-charcoal" />
        <div className="flex h-14 items-center justify-center bg-charcoal/95 px-4">
          <Link
            to="/"
            className="font-heading text-sm uppercase tracking-[0.3em] text-warm-white sm:text-base"
          >
            THE HEIGHTS
          </Link>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        className={`inset-x-0 top-0 z-50 ${
          isHeroRoute
            ? "fixed bg-gradient-to-b from-charcoal/90 via-charcoal/40 to-transparent"
            : "sticky bg-charcoal/95"
        }`}
      >
        <nav className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 text-white sm:min-h-[72px] sm:gap-5">
          <Link
            to="/home"
            aria-label={`${houseName} home`}
            className="flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14"
          >
            <img src={logo} alt={houseName} className="property-logo-shadow h-full w-full object-contain" />
          </Link>

          <div className="hidden items-center gap-3 lg:flex xl:gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`whitespace-nowrap text-[10px] uppercase tracking-[0.15em] transition-colors ${
                  location.pathname === link.to ? "text-gold" : "text-white/85 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="ml-auto hidden sm:flex lg:ml-0">
            <Link
              to="/booking"
              className="rounded-full bg-amber-400 px-5 py-2 text-xs font-semibold text-neutral-950 transition-colors hover:bg-amber-300 sm:px-6"
            >
              Book Now
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="property-mobile-navigation"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/40 bg-charcoal/40 text-white backdrop-blur-sm transition-colors hover:bg-white/15 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </nav>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/65 backdrop-blur-sm"
          />
          <nav
            id="property-mobile-navigation"
            aria-label="Property navigation"
            className="absolute inset-y-0 right-0 flex w-[min(88vw,360px)] flex-col bg-charcoal px-6 pb-8 pt-5 shadow-2xl shadow-black/40"
          >
            <div className="mb-8 flex items-center justify-between gap-4 border-b border-white/10 pb-5">
              <img src={logo} alt={houseName} className="property-logo-shadow h-12 w-12 object-contain" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`border-b border-white/10 py-4 text-sm uppercase tracking-[0.14em] ${
                    location.pathname === link.to ? "text-gold" : "text-white/85"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <Link
              to="/booking"
              onClick={() => setMobileOpen(false)}
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-amber-400 px-6 text-sm font-semibold text-neutral-950"
            >
              Book Now
            </Link>
            <a
              href={`tel:${phoneNumber.replace(/[^0-9+]/g, "")}`}
              className="mt-auto pt-8 text-center text-sm text-slate-300"
            >
              Call {phoneNumber}
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
