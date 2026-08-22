import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ArrowLeft, Phone } from "lucide-react";
import { useGuestHouse } from "@/lib/guest-house-context";
import ghLogo from "@/assets/gh-logo.jpg";
import nhLogo from "@/assets/inspiration pitures/WhatsApp Image 2026-08-22 at 1.11.41 AM.jpeg";

const navLinks = [
  { to: "/home" as const, label: "Home" },
  { to: "/accommodation" as const, label: "Accommodation" },
  { to: "/dining" as const, label: "Dining" },
  { to: "/gallery" as const, label: "Gallery" },
  { to: "/reviews" as const, label: "Reviews" },
  { to: "/about" as const, label: "About" },
  { to: "/contact" as const, label: "Contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeHouse, houseName, phoneNumber } = useGuestHouse();
  const location = useLocation();

  const logo = activeHouse === "greater-heights" ? ghLogo : nhLogo;
  const isHome = location.pathname === "/";

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/home" className="flex items-center gap-2">
          {!isHome && (
            <img
              src={logo}
              alt={houseName}
              className="h-16 w-16 rounded-full border-2 border-gold/60 object-contain bg-warm-white"
            />
          )}
          <div className="hidden sm:block">
            <span className="block text-sm font-heading text-warm-white leading-tight">
              {houseName}
            </span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-xs tracking-widest uppercase transition-colors ${location.pathname === link.to ? "text-gold" : "text-warm-white/80 hover:text-gold-light"}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {!isHome && (
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1 text-xs tracking-widest uppercase text-gold-light/70 hover:text-gold-light transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Properties
            </Link>
          )}
          <a
            href={`tel:${phoneNumber.replace(/[^0-9+]/g, "")}`}
            title={`Call ${phoneNumber}`}
            aria-label={`Call ${phoneNumber}`}
            className="hidden md:flex items-center text-gold-light/80 hover:text-gold-light"
          >
            <Phone className="h-5 w-5" />
          </a>
          <Link to="/booking" className="hidden sm:block btn-gold text-xs px-4 py-2">
            Reservation
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-warm-white">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden bg-charcoal border-t border-gold/20 px-4 pb-6">
          {!isHome && (
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 py-3 text-sm tracking-widest uppercase text-gold-light/70 hover:text-gold-light border-b border-gold/10"
            >
              <ArrowLeft className="h-4 w-4" />
              All Properties
            </Link>
          )}
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-sm tracking-widest uppercase text-warm-white/80 hover:text-gold-light border-b border-gold/10"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/booking"
            onClick={() => setMobileOpen(false)}
            className="mt-4 block btn-gold text-center"
          >
            Reservation
          </Link>
        </div>
      )}
    </header>
  );
}
