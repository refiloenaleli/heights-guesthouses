import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  Users,
  Coffee,
  Shield,
  Wifi,
  Car,
  UtensilsCrossed,
  Tag,
  Phone,
  MessageCircle,
  Sparkles,
  ChefHat,
  ArrowLeft,
  BedDouble,
  Building2,
} from "lucide-react";
import { useGuestHouse } from "@/lib/guest-house-context";
import { useSiteImage, useSiteImageSet } from "@/lib/site-images-context";
import { PropertyMap } from "@/components/PropertyMap";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Promotion = Tables<"promotions">;
import ghExterior from "@/assets/gh-exterior.jpg";
import nhExterior1 from "@/assets/nh-exterior1.jpg";
import ghCoupleRoom from "@/assets/gh-couple-room.jpg";
import ghSharingRoom from "@/assets/gh-sharing-room.jpg";
import ghOutdoorDining from "@/assets/gh-outdoor-dining.jpg";
import nhCoupleRoom from "@/assets/nh-couple-room.jpg";
import nhSharingRoom from "@/assets/nh-sharing-room.jpg";
import nhDining2 from "@/assets/nh-dining2.jpg";
import ghLogo from "@/assets/gh-logo.jpg";
import nhLogo from "@/assets/nh-logo-transparent.png";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

const features = [
  {
    icon: MapPin,
    title: "Prime Location",
    desc: "Centrally located in Katlehong, Maseru",
  },
  {
    icon: Shield,
    title: "Secure & Safe",
    desc: "24/7 security and CCTV monitoring for your peace of mind",
  },
  {
    icon: Users,
    title: "Friendly Staff",
    desc: "Our welcoming team ensures a seamless, personalised experience",
  },
  {
    icon: Star,
    title: "Best Value",
    desc: "Enjoy unbeatable prices with fantastic offers tailored for you",
  },
];

function HomePage() {
  const { activeHouse, houseName, whatsappNumbers, phoneNumber, address } = useGuestHouse();
  const heroLogo = useSiteImage(
    `logo.${activeHouse}`,
    activeHouse === "greater-heights" ? ghLogo : nhLogo,
  );
  const heroImage = useSiteImage(
    `${activeHouse}.home.hero`,
    activeHouse === "greater-heights" ? ghExterior : nhExterior1,
  );
  const welcomeFallbacks =
    activeHouse === "greater-heights"
      ? [ghCoupleRoom, ghSharingRoom]
      : [nhCoupleRoom, nhSharingRoom];
  const welcomeImages = useSiteImageSet(
    welcomeFallbacks.map((fallback, index) => ({
      slotKey: `${activeHouse}.home.welcome.${index + 1}`,
      fallback,
      legacySlotKey: `${activeHouse}.home.welcome`,
      legacyIndex: index,
    })),
  );
  const diningImage = useSiteImage(
    `${activeHouse}.home.dining_cta`,
    activeHouse === "greater-heights" ? ghOutdoorDining : nhDining2,
  );

  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("promotions")
      .select("*")
      .eq("guest_house", activeHouse)
      .eq("is_active", true)
      .then(({ data, error }) => {
        if (cancelled || error) return;
        setPromotions(data || []);
      });
    return () => {
      cancelled = true;
    };
  }, [activeHouse]);

  const isGreaterHeights = activeHouse === "greater-heights";

  return (
    <>
      {/* Hero */}
      <section className="photo-hero photo-hero-fixed-nav relative h-[85vh] min-h-[600px] -mt-[60px]">
        <img
          src={heroImage}
          alt={houseName}
          className="photo-hero-image absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="photo-hero-overlay hero-overlay absolute inset-0" />
        <div className="photo-hero-content relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <motion.div
            className="home-hero-copy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={heroLogo}
              alt=""
              className="property-logo-shadow mx-auto mb-1 h-8 w-8 object-contain sm:mb-5 sm:h-36 sm:w-36 md:h-40 md:w-40"
            />
            <h1 className="mb-1 font-heading text-lg font-normal leading-tight tracking-wide text-warm-white sm:mb-4 sm:text-4xl md:text-5xl">
              {houseName}
            </h1>
            <p className="mx-auto mb-2 max-w-xl text-[10px] leading-tight text-warm-white/90 sm:mb-8 sm:text-sm sm:leading-relaxed md:text-base">
              {isGreaterHeights
                ? "Katlehong, Maseru — Hospitality, warmth, tranquility and delicious food for both leisure and business travellers."
                : "Comfortable stays, generous spaces and hospitality designed for groups, business and events."}
            </p>
            <div className="flex justify-center gap-2 sm:gap-3">
              <Link to="/accommodation" className="btn-gold px-3 py-1 text-[9px] sm:px-8 sm:py-3 sm:text-xs">
                Explore
              </Link>
              <Link
                to="/booking"
                className="btn-gold-outline border-warm-white/50 px-3 py-1 text-[9px] text-warm-white hover:bg-warm-white hover:text-charcoal sm:px-8 sm:py-3 sm:text-xs"
              >
                Book Now
              </Link>
            </div>
          </motion.div>
        </div>
        {/* Back to Properties */}
        <div className="bg-charcoal/95 border-b border-gold/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gold-light/70 hover:text-gold transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Promotions Banner */}
      {promotions.length > 0 && (
        <section className="py-8 bg-gold-dark">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center gap-3 justify-center flex-wrap">
              <Tag className="h-5 w-5 text-warm-white" />
              {promotions.map((promo) => (
                <div key={promo.id} className="flex items-center gap-3 text-center">
                  {promo.image_url && (
                    <img
                      src={promo.image_url}
                      alt={promo.title}
                      loading="lazy"
                      className="h-12 w-12 rounded border border-warm-white/40 object-cover"
                    />
                  )}
                  <div className="text-center">
                    <span className="text-warm-white font-heading text-lg">{promo.title}</span>
                    {(promo.discount_percentage ?? 0) > 0 && (
                      <span className="ml-2 bg-warm-white text-gold-dark px-2 py-0.5 text-xs font-bold">
                        {promo.discount_percentage}% OFF
                      </span>
                    )}
                    {promo.description && (
                      <p className="text-warm-white/80 text-xs mt-1">{promo.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 bg-card">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((f, i) => (
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

      {/* Atmosphere Section */}
      {isGreaterHeights && (
        <section className="py-20 bg-cream">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-3"
              >
                {welcomeImages.map((src, i) => (
                  <img
                    key={`${src}-${i}`}
                    src={src}
                    alt={`Greater Heights atmosphere ${i + 1}`}
                    loading="lazy"
                    className={`w-full h-48 object-cover ${i % 2 === 1 ? "mt-6" : ""}`}
                  />
                ))}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="section-label">Atmosphere</span>
                <h2 className="section-title mt-2 mb-4">Welcome to {houseName}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Hospitality, warmth, tranquility and delicious food for both leisure and business
                  travellers; families are welcome.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A spacious air-conditioned lounge, and a bar facility that can be stocked and
                  opened with prior arrangement for group bookings or conferences.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Welcome Section (for New Heights) */}
      {!isGreaterHeights && (
        <section className="py-20 bg-cream">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-3"
              >
                {welcomeImages.map((src, i) => (
                  <img
                    key={`${src}-${i}`}
                    src={src}
                    alt={`${houseName} room ${i + 1}`}
                    loading="lazy"
                    className={`w-full h-48 object-cover ${i % 2 === 1 ? "mt-6" : ""}`}
                  />
                ))}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="section-label">Welcome to {houseName}</span>
                <h2 className="section-title mt-2 mb-4">
                  Luxury guest house in the heart of Lesotho
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {houseName}, located in the heart of Maseru, offers modern, luxurious rooms
                  designed for comfort and relaxation. Our friendly staff ensures a seamless,
                  personalised experience with stunning views. Discover true luxury and hospitality
                  with us.
                </p>
                <Link to="/accommodation" className="btn-gold-outline inline-block">
                  Read More →
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Cuisine, Connectivity, Relaxation & Spa (Greater Heights) */}
      {isGreaterHeights && (
        <section className="py-20 bg-cream">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-12">
              <span className="section-label">Amenities</span>
              <h2 className="section-title mt-2">Cuisine, Connectivity, Relaxation & Spa</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card border border-border p-8"
              >
                <ChefHat className="h-8 w-8 text-gold-dark mb-4" />
                <h3 className="font-heading text-xl text-foreground mb-3">Cuisine</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  In-house chef, full English breakfast included, lunch/dinner on request,
                  undercover barbecue facilities.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-card border border-border p-8"
              >
                <Wifi className="h-8 w-8 text-gold-dark mb-4" />
                <h3 className="font-heading text-xl text-foreground mb-3">Connectivity</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Reliable Wi-Fi throughout. Quiet garden areas, DStv in the lounge and every room.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-card border border-border p-8"
              >
                <Sparkles className="h-8 w-8 text-gold-dark mb-4" />
                <h3 className="font-heading text-xl text-foreground mb-3">Relaxation & Spa</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Quiet garden areas for relaxation, and an on-site spa offering full body massage.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-card border border-border p-8"
              >
                <Coffee className="h-8 w-8 text-gold-dark mb-4" />
                <h3 className="font-heading text-xl text-foreground mb-3">Dining</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Full English breakfast included with your stay. Lunch and dinner available on
                  request. Undercover barbecue facilities for gatherings.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Amenities (for New Heights) */}
      {!isGreaterHeights && (
        <section className="py-20 bg-cream">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-12">
              <span className="section-label">Modern & Comfortable</span>
              <h2 className="section-title mt-2">Facilities & Amenities</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[
                {
                  icon: BedDouble,
                  title: "Rooms & Capacity",
                  description:
                    "15 rooms, each sleeping up to 3 guests sharing, for a maximum capacity of 45 guests. Rooms are equipped to the same standard as Greater Heights: air conditioning, bar fridge, coffee/tea, Wi-Fi, and TV in every room.",
                },
                {
                  icon: ChefHat,
                  title: "Dining, Kitchen & Spa",
                  description:
                    "Its own in-house kitchen, dining facility, and on-site spa — independent of Greater Heights, so guests are catered for on-site regardless of which property they choose.",
                },
                {
                  icon: Building2,
                  title: "Conference Room",
                  description:
                    "One large conference room accommodating up to 300 delegates, reconfigurable to a smaller footprint using a sliding door — the group’s primary venue for large conferences and events.",
                },
              ].map(({ icon: Icon, title, description }, index) => (
                <motion.article
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="h-full border border-border bg-card p-6 sm:p-8"
                >
                  <Icon className="mb-5 h-8 w-8 text-gold-dark" />
                  <h3 className="mb-3 font-heading text-xl text-foreground">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dining CTA */}
      <section className="photo-hero photo-hero-fixed-nav relative h-[50vh] min-h-[400px]">
        <img
          src={diningImage}
          alt="Dining"
          loading="lazy"
          className="photo-hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="photo-hero-overlay hero-overlay absolute inset-0" />
        <div className="photo-hero-content relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <span className="section-label text-gold-light mb-2">Fine Dining</span>
          <h2 className="font-heading text-3xl md:text-5xl text-warm-white mb-4">
            Explore Our Dining Experience
          </h2>
          <Link to="/dining" className="btn-gold">
            View Menu
          </Link>
        </div>
      </section>

      {/* Property location */}
      <section className="py-20 bg-cream">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-10">
              <span className="section-label">Find Us</span>
              <h2 className="section-title mt-2">Location</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="h-5 w-5 text-gold-dark mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">{address}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  {isGreaterHeights
                    ? 'GPS: 29° 19\' 37.8" S, 27° 29\' 17.8" E'
                    : "Maseru, Lesotho"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {whatsappNumbers.map((whatsappNumber) => (
                    <a
                      key={whatsappNumber}
                      href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello, I would like to make a booking at ${houseName}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold inline-flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" /> WhatsApp {whatsappNumber}
                    </a>
                  ))}
                  <a
                    href={`tel:${phoneNumber.replace(/[^0-9+]/g, "")}`}
                    className="btn-gold-outline inline-flex items-center justify-center gap-2"
                    aria-label={`Call us at ${phoneNumber}`}
                  >
                    <Phone className="h-4 w-4" /> {phoneNumber}
                  </a>
                </div>
              </div>
              <PropertyMap activeHouse={activeHouse} houseName={houseName} />
            </div>
          </div>
        </section>

      {/* WhatsApp Float */}
      <a
        href={`https://wa.me/${whatsappNumbers[0]?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello, I would like to make a booking.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg hover:scale-110 transition-transform"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </>
  );
}
