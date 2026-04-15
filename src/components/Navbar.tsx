import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { useGuestHouse, type GuestHouse } from "@/lib/guest-house-context";
import ghLogo from "@/assets/gh-logo.jpg";
import nhLogo from "@/assets/nh-logo.jpg";

const navLinks = [
  { to: "/" as const, label: "Home" },
  { to: "/accommodation" as const, label: "Accommodation" },
  { to: "/dining" as const, label: "Dining" },
  { to: "/gallery" as const, label: "Gallery" },
  { to: "/reviews" as const, label: "Reviews" },
  { to: "/contact" as const, label: "Contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeHouse, setActiveHouse, houseName } = useGuestHouse();
  const location = useLocation();

  const logo = activeHouse === "greater-heights" ? ghLogo : nhLogo;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-charcoal/95 backdrop-blur-sm">
      <div className="border-b border-gold/20 bg-charcoal">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <div className="flex gap-1">
            {(["greater-heights", "new-heights"] as GuestHouse[]).map((house) => (
              <button
                key={house}
                onClick={() => setActiveHouse(house)}
                className={`px-3 py-1 text-xs tracking-widest uppercase transition-all ${
                  activeHouse === house
                    ? "bg-gold-dark text-warm-white"
                    : "text-gold-light/70 hover:text-gold-light"
                }`}
              >
                {house === "greater-heights" ? "Greater Heights" : "New Heights"}
              </button>
            ))}
          </div>
          <a href="tel:+26600000000" className="flex items-center gap-1 text-xs text-gold-light/70 hover:text-gold-light">
            <Phone className="h-3 w-3" />
            <span className="hidden sm:inline">Call Us</span>
          </a>
        </div>
      </div>

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt={houseName} className="h-10 w-10 object-contain" />
          <div className="hidden sm:block">
            <span className="block text-sm font-heading text-warm-white leading-tight">{houseName}</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className={`text-xs tracking-widest uppercase transition-colors ${location.pathname === link.to ? "text-gold" : "text-warm-white/80 hover:text-gold-light"}`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/booking" className="hidden sm:block btn-gold text-xs px-4 py-2">Reservation</Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-warm-white">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden bg-charcoal border-t border-gold/20 px-4 pb-6">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="block py-3 text-sm tracking-widest uppercase text-warm-white/80 hover:text-gold-light border-b border-gold/10">
              {link.label}
            </Link>
          ))}
          <Link to="/booking" onClick={() => setMobileOpen(false)} className="mt-4 block btn-gold text-center">Reservation</Link>
        </div>
      )}
    </header>
  );
}
