import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { useGuestHouse } from "@/lib/guest-house-context";
import { useSiteImage } from "@/lib/site-images-context";
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

  const logo = useSiteImage(
    `logo.${activeHouse}`,
    activeHouse === "greater-heights" ? ghLogo : nhLogo,
  );
  const isHome = location.pathname === "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-charcoal/90 backdrop-blur-md border-b border-gold/10">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/home" className="flex items-center gap-3">
          {!isHome && <img src={logo} alt={houseName} className="h-12 w-12 object-contain" />}
          <div className="hidden sm:block">
            <span className="block text-sm font-heading text-warm-white leading-tight tracking-wide">
              {houseName}
            </span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-xs tracking-[0.2em] uppercase transition-colors font-medium ${
                location.pathname === link.to ? "text-gold" : "text-warm-white/70 hover:text-gold"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a
            href={`tel:${phoneNumber.replace(/[^0-9+]/g, "")}`}
            title={`Call ${phoneNumber}`}
            aria-label={`Call ${phoneNumber}`}
            className="flex items-center justify-center h-9 w-9 rounded-full border border-gold/30 text-gold-light/80 hover:text-gold hover:border-gold transition-colors"
          >
            <Phone className="h-4 w-4" />
          </a>
          <Link
            to="/booking"
            className="hidden sm:block btn-gold text-[10px] px-5 py-2.5 tracking-[0.2em]"
          >
            Reservation
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-warm-white">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden bg-charcoal/95 backdrop-blur-md border-t border-gold/20 px-4 pb-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-sm tracking-[0.2em] uppercase text-warm-white/80 hover:text-gold border-b border-gold/10"
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
