import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  ArrowRight,
  Building2,
  BedDouble,
  UtensilsCrossed,
  Wifi,
  Shield,
  Car,
} from "lucide-react";
import { useGuestHouse, type GuestHouse } from "@/lib/guest-house-context";
import ghExterior from "@/assets/gh-exterior.jpg";
import nhExterior1 from "@/assets/nh-exterior1.jpg";
import ghLogo from "@/assets/gh-logo.jpg";
import nhLogo from "@/assets/inspiration pitures/WhatsApp Image 2026-08-22 at 1.11.41 AM.jpeg";

export const Route = createFileRoute("/")({
  component: PropertySelectPage,
});

const properties: {
  id: GuestHouse;
  name: string;
  tagline: string;
  description: string;
  image: string;
  logo: string;
  features: { icon: typeof BedDouble; label: string }[];
}[] = [
  {
    id: "greater-heights",
    name: "Greater Heights Guest House",
    tagline: "Intimate. Warm. Effortlessly comfortable.",
    description:
      "A welcoming Maseru retreat for restful stays, corporate travellers and smaller gatherings.",
    image: ghExterior,
    logo: ghLogo,
    features: [
      { icon: BedDouble, label: "10 Air-Conditioned Rooms" },
      { icon: UtensilsCrossed, label: "In-House Chef" },
      { icon: Wifi, label: "Reliable Wi-Fi" },
      { icon: Shield, label: "24/7 Security" },
    ],
  },
  {
    id: "new-heights",
    name: "New Heights Guest House",
    tagline: "More room. More possibilities.",
    description:
      "Designed for larger groups, conferences, events and stays that need a little more space.",
    image: nhExterior1,
    logo: nhLogo,
    features: [
      { icon: BedDouble, label: "Comfort Rooms" },
      { icon: UtensilsCrossed, label: "Restaurant" },
      { icon: Wifi, label: "Free WiFi" },
      { icon: Car, label: "Free Parking" },
    ],
  },
];

function PropertySelectPage() {
  const { setActiveHouse } = useGuestHouse();

  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] -mt-[88px]">
        <img
          src={ghExterior}
          alt="Heights Guest Houses"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="section-label text-gold-light">TWO HOMES. ONE TRUSTED HOST.</span>
            <div className="mb-4 mt-4 flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-gold text-gold" />
              ))}
            </div>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl text-warm-white font-normal tracking-wide mb-4">
              Heights Guest Houses
            </h1>
            <p className="max-w-2xl mx-auto text-warm-white/80 text-sm md:text-base mb-8 leading-relaxed">
              Two welcoming homes. One trusted host in Maseru. Choose between Greater Heights and
              New Heights for your perfect stay.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/home"
                onClick={() => setActiveHouse("greater-heights")}
                className="btn-gold"
              >
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
          </motion.div>
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
            <p className="font-accent mt-8 text-xl text-gold-dark">
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
                className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Property Image */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    width={800}
                    height={600}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <span className="font-accent text-lg text-gold-light">
                        {property.tagline}
                      </span>
                      <h3 className="font-heading text-2xl text-warm-white mt-1">
                        {property.name}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {property.description}
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {property.features.map((f) => (
                      <div key={f.label} className="flex items-center gap-2">
                        <f.icon className="h-4 w-4 text-gold-dark flex-shrink-0" />
                        <span className="text-xs font-medium text-foreground">{f.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
                    <MapPin className="h-4 w-4 text-gold-dark" />
                    Maseru, Lesotho
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      to="/home"
                      onClick={() => setActiveHouse(property.id)}
                      className="btn-gold flex-1 text-center inline-flex items-center justify-center gap-2"
                    >
                      Explore {property.id === "greater-heights" ? "Greater" : "New"} Heights
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/booking"
                      onClick={() => setActiveHouse(property.id)}
                      className="btn-gold-outline flex-1 text-center"
                    >
                      Book Now
                    </Link>
                  </div>
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
