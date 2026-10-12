import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  Building2,
  Shield,
} from "lucide-react";
import { useRef, useState } from "react";
import { useGuestHouse, type GuestHouse } from "@/lib/guest-house-context";
import { useSiteImage } from "@/lib/site-images-context";
import ghExterior from "@/assets/gh-exterior.jpg";
import nhExterior1 from "@/assets/nh-exterior1.jpg";
import ghLogo from "@/assets/gh-logo.jpg";
import nhLogo from "@/assets/nh-logo-transparent.png";

export const Route = createFileRoute("/")({
  component: PropertySelectPage,
});

const properties: {
  id: GuestHouse;
  name: string;
  description: string;
  logo: string;
}[] = [
  {
    id: "greater-heights",
    name: "Greater Heights Guest House",
    description:
      "Katlehong, Maseru — intimate stays, smaller meetings, corporate travellers. 10 rooms, up to 25 guests, 2 conference rooms.",
    logo: ghLogo,
  },
  {
    id: "new-heights",
    name: "New Heights Guest House",
    description:
      "Khubetsoana, Lerakong, Maseru — larger stays, big conferences, events, group packages. 15 rooms, up to 45 guests, 1 conference room up to 300 delegates.",
    logo: nhLogo,
  },
];

function PropertySelectPage() {
  const { setActiveHouse } = useGuestHouse();
  const [activeSlide, setActiveSlide] = useState(0);
  const heroTrackRef = useRef<HTMLDivElement>(null);
  const cardImages: Record<GuestHouse, string> = {
    "greater-heights": useSiteImage("landing.card.greater-heights", ghExterior),
    "new-heights": useSiteImage("landing.card.new-heights", nhExterior1),
  };
  const propertyLogos: Record<GuestHouse, string> = {
    "greater-heights": useSiteImage("logo.greater-heights", ghLogo),
    "new-heights": useSiteImage("logo.new-heights", nhLogo),
  };

  return (
    <>
      <section className="gateway-property-hero relative -mt-[60px] h-[82vh] min-h-[560px] overflow-hidden bg-charcoal">
        <div className="absolute left-1/2 top-20 z-30 w-full max-w-2xl -translate-x-1/2 px-4 text-center">
          <span className="section-label text-gold-light">TWO HOMES. ONE TRUSTED HOST.</span>
          <h1 className="mt-3 font-heading text-3xl font-normal text-white md:text-4xl">
            Heights Guest Houses
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/85 md:text-base">
            Two welcoming homes. One trusted host in Maseru. Choose between Greater Heights and New
            Heights for your perfect stay.
          </p>
        </div>
        <div
          ref={heroTrackRef}
          onScroll={(event) => {
            const track = event.currentTarget;
            setActiveSlide(Math.min(1, Math.round(track.scrollLeft / track.clientWidth)));
          }}
          aria-label="Choose a guest house. Swipe to see both properties."
          className="hero-property-track relative z-10 flex h-full flex-row overflow-x-auto snap-x snap-mandatory md:overflow-hidden"
        >
          {properties.map((property) => (
            <div
              key={property.id}
              className="group relative h-full w-full flex-none snap-center overflow-hidden border-r border-white/10 transition-[flex] duration-700 md:w-auto md:flex-1 md:hover:flex-[1.15]"
            >
              <img
                src={cardImages[property.id]}
                alt={`${property.name} exterior`}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-neutral-950/50 transition-colors duration-500 group-hover:bg-neutral-950/35" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/55" />
              <div className="absolute inset-x-0 bottom-14 z-10 flex flex-col items-center px-5 text-center">
                <h2 className="mb-5 font-heading text-3xl font-normal text-white md:text-4xl">
                  {property.name.replace(" Guest House", "")}
                </h2>
                <Link
                  to="/home"
                  onClick={() => setActiveHouse(property.id)}
                  className="rounded-full border border-white/55 bg-white/10 px-7 py-3 text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur-md transition-colors hover:bg-white/20"
                >
                  Enter Property
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 md:hidden" aria-label="Hero slides">
          {properties.map((property, index) => (
            <button
              key={property.id}
              type="button"
              aria-label={`Show ${property.name}`}
              aria-current={activeSlide === index ? "true" : undefined}
              onClick={() => {
                heroTrackRef.current?.scrollTo({
                  left: index * (heroTrackRef.current.clientWidth || 0),
                  behavior: "smooth",
                });
                setActiveSlide(index);
              }}
              className={`h-2.5 rounded-full transition-all ${
                activeSlide === index ? "w-7 bg-amber-300" : "w-2.5 bg-white/55"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-20 bg-cream">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-label">Welcome to the Heights</span>
            <h2 className="section-title mt-2 mb-6">One Trusted Group. Two Distinct Properties.</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Greater Heights and New Heights operate together as one group, under shared ownership
              and management. Two distinct properties, each with its own character and capacity,
              giving you a choice suited to the size and nature of your stay or event — from an
              intimate weekend to a large conference, all from within the same trusted group.
            </p>
            <p className="font-accent mt-8 text-2xl text-gold-dark">
              Stay somewhere that feels considered.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Property Picker */}
      <section className="py-20 bg-background">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <span className="section-label">Select Your Property</span>
            <h2 className="section-title mt-2">Choose Your Stay</h2>
            <p className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Each of our guest houses offers a unique experience. Select the one that best suits
              your needs and begin your journey with us.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {properties.map((property, i) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl"
              >
                <div className="mb-6 flex items-center gap-4 border-b border-border pb-5">
                  <img
                    src={propertyLogos[property.id]}
                    alt={property.name}
                    className={`h-14 w-14 shrink-0 rounded-full ${
                      property.id === "greater-heights"
                        ? "border-2 border-gold/70 p-1 object-cover ring-2 ring-gold/20"
                        : "object-contain"
                    }`}
                    width={56}
                    height={56}
                  />
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gold-light">
                      Guest House
                    </span>
                    <h3 className="mt-1 font-heading text-2xl text-foreground">
                      {property.name.replace(" Guest House", "")}
                    </h3>
                  </div>
                </div>

                <p className="mb-6 max-w-prose text-sm leading-7 text-muted-foreground">
                  {property.description}
                </p>

                <div>
                  <Link
                    to="/booking"
                    onClick={() => setActiveHouse(property.id)}
                    className="btn-gold inline-flex items-center justify-center rounded-full px-6 py-2.5 text-[10px]"
                  >
                    Book Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-cream">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <span className="section-label">The Heights Experience</span>
            <h2 className="section-title mt-2">Why Choose Us</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: MapPin, title: "Prime Location", desc: "Centrally located in Maseru" },
              { icon: Shield, title: "Secure & Safe", desc: "24/7 security & CCTV" },
              { icon: Star, title: "Best Value", desc: "Unbeatable prices & offers" },
              { icon: Building2, title: "Two Properties", desc: "Choose your perfect stay" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <f.icon className="mx-auto h-8 w-8 text-gold-dark mb-3" />
                <h3 className="font-heading text-base text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-charcoal">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl text-warm-white mb-4">
            Ready to Experience the Heights?
          </h2>
          <p className="text-warm-white/70 text-sm md:text-base mb-8 max-w-xl mx-auto leading-relaxed">
            Book your stay today and discover why we're the preferred choice for travellers in
            Lesotho.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/home" onClick={() => setActiveHouse("greater-heights")} className="btn-gold">
              Book Greater Heights
            </Link>
            <Link
              to="/home"
              onClick={() => setActiveHouse("new-heights")}
              className="btn-gold-outline text-warm-white border-warm-white/50 hover:bg-warm-white hover:text-charcoal"
            >
              Book New Heights
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
