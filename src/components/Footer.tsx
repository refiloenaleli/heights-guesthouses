import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin } from "lucide-react";
import { useGuestHouse } from "@/lib/guest-house-context";
import ghLogo from "@/assets/gh-logo.jpg";
import nhLogo from "@/assets/inspiration pitures/WhatsApp Image 2026-08-22 at 1.11.41 AM.jpeg";

export function Footer() {
  const { houseName, email, whatsappNumber, phoneNumber, address, activeHouse } = useGuestHouse();
  const logo = activeHouse === "greater-heights" ? ghLogo : nhLogo;

  return (
    <footer className="bg-charcoal text-warm-white/80">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <img
              src={logo}
              alt={houseName}
              className="mb-4 h-20 w-20 object-contain"
            />
            <p className="text-sm font-heading text-warm-white mb-2">{houseName}</p>
            <p className="text-xs leading-relaxed text-warm-white/60">
              Experience luxury accommodation in the heart of Lesotho. Your comfort is our priority.
            </p>
          </div>

          <div>
            <h4 className="section-label text-gold-light mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[
                { to: "/home" as const, label: "Home" },
                { to: "/accommodation" as const, label: "Accommodation" },
                { to: "/dining" as const, label: "Dining & Menus" },
                { to: "/gallery" as const, label: "Gallery" },
                { to: "/about" as const, label: "About" },
                { to: "/booking" as const, label: "Book Now" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-warm-white/60 hover:text-gold-light transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="section-label text-gold-light mb-4">Contact Us</h4>
            <div className="flex flex-col gap-3">
              <a
                href={`tel:${phoneNumber.replace(/[^0-9+]/g, "")}`}
                className="flex items-center gap-2 text-sm text-warm-white/60 hover:text-gold-light"
                aria-label={`Call us at ${phoneNumber}`}
              >
                <Phone className="h-4 w-4 text-gold-dark" />
              </a>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-sm text-warm-white/60 hover:text-gold-light"
              >
                <Mail className="h-4 w-4 text-gold-dark" /> {email}
              </a>
              <div className="flex items-start gap-2 text-sm text-warm-white/60">
                <MapPin className="h-4 w-4 mt-0.5 text-gold-dark" /> {address}
              </div>
            </div>
          </div>

          <div>
            <h4 className="section-label text-gold-light mb-4">Our Properties</h4>
            <p className="text-sm text-warm-white/60 mb-2">Greater Heights Guest House</p>
            <p className="text-sm text-warm-white/60 mb-4">New Heights Guest House</p>
            <Link
              to="/booking"
              className="btn-gold-outline text-warm-white/80 border-gold-dark/50 hover:bg-gold-dark hover:text-warm-white text-xs inline-block"
            >
              Book Now
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-gold/10 pt-6 text-center text-xs text-warm-white/40">
          © {new Date().getFullYear()} Greater Heights & New Heights Guest Houses. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
